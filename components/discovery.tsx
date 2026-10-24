"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Coffee,
  Globe2,
  HeartHandshake,
  List,
  LogIn,
  LogOut,
  Map as MapIcon,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  categories,
  intentions,
  names,
  availabilityText,
  compensationText,
  type Category,
  type Intention,
  type Language,
  type Listing,
} from "@/lib/data";
import { signOut } from "@/app/actions";
import { copy } from "@/lib/i18n";
import AuthForm from "./auth-form";
import { ActionIcon } from "./icons";
import Modal from "./modal";
import PostForm from "./post-form";
const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <MapPin size={32} />
      <span>Machmaso · München</span>
    </div>
  ),
});
type Notice = "posted" | "authConfirmed" | "authLinkError";
export default function Discovery({
  initialListings,
  demoData = false,
  authAvailable = false,
  viewer = null,
  authStatus = null,
}: {
  initialListings: Listing[];
  demoData?: boolean;
  authAvailable?: boolean;
  viewer?: { name: string } | null;
  authStatus?: "confirmed" | "error" | null;
}) {
  const [language, setLanguage] = useState<Language>("en");
  // Server-rendered; Server Actions revalidate the page after changes.
  const listings = initialListings;
  const [query, setQuery] = useState("");
  const [intention, setIntention] = useState<Intention | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [view, setView] = useState<"map" | "list">("map");
  const [selected, setSelected] = useState<Listing | null>(null);
  const [dialog, setDialog] = useState<
    "auth" | "post" | "request" | "confirmation" | null
  >(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<Notice | null>(
    authStatus === "confirmed"
      ? "authConfirmed"
      : authStatus === "error"
        ? "authLinkError"
        : null,
  );
  const [signingOut, startSignOut] = useTransition();
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const handleMapUnavailable = useCallback(() => {
    setMapUnavailable(true);
    setView("list");
  }, []);
  const t = copy[language];
  const n = names[language];
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  // Drop ?auth=… from the address bar once its notice is shown.
  useEffect(() => {
    if (!authStatus) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.replaceState(null, "", url);
  }, [authStatus]);
  const filtered = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (intention === "all" || listing.intention === intention) &&
          (category === "all" || listing.category === category) &&
          `${listing.title} ${listing.description} ${listing.neighborhood} ${names[language].categories[listing.category]} ${names[language].intentions[listing.intention]}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
      ),
    [listings, intention, category, query, language],
  );
  const select = useCallback((listing: Listing) => setSelected(listing), []);
  function clear() {
    setQuery("");
    setIntention("all");
    setCategory("all");
  }
  function posted(listing: Listing) {
    clear();
    setDialog(null);
    setSelected(listing);
    setNotice("posted");
  }
  function startPosting() {
    setDialog(viewer ? "post" : "auth");
  }
  const activeFilters =
    intention !== "all" || category !== "all" || query !== "";
  return (
    <>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Machmaso">
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>
          machmaso<span className="brand-period">.</span>
        </Link>
        <nav aria-label={t.explore}>
          <a className="nav-active" href="#discover">
            {t.explore}
          </a>
          <span className="nav-city">
            <MapPin size={15} />
            {t.city}
          </span>
        </nav>
        <div className="header-actions">
          <div className="language-switch" role="group" aria-label={t.language}>
            <Globe2 size={15} />
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                lang={lang}
                aria-pressed={language === lang}
                onClick={() => setLanguage(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          {viewer ? (
            <div className="account">
              <span className="account-name">
                <span className="sr-only">{t.signedInAs} </span>
                {viewer.name}
              </span>
              <button
                className="text-button"
                disabled={signingOut}
                onClick={() => startSignOut(async () => void (await signOut()))}
              >
                <LogOut size={14} />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            authAvailable && (
              <button
                className="text-button sign-in-button"
                onClick={() => setDialog("auth")}
              >
                <LogIn size={14} />
                <span>{t.signIn}</span>
              </button>
            )
          )}
          <button className="primary post-button" onClick={startPosting}>
            <Plus size={18} />
            <span>{t.post}</span>
          </button>
        </div>
      </header>
      <main>
        <section className="intro">
          <div className="intro-copy">
            <p className="eyebrow">
              <span className="demo-kicker">DEMO</span>
              {t.eyebrow}
            </p>
            <h1>
              {t.headline}
              <br />
              <span>{t.headlineAccent}</span>
            </h1>
            <p className="intro-subtitle">{t.subtitle}</p>
          </div>
          <div className="intro-visual" aria-hidden="true">
            <svg className="orbit" viewBox="0 0 300 190">
              <path
                d="M35 135C-20 45 145 0 232 55S235 180 130 169 72 50 160 41"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="5 6"
              />
            </svg>
            <div className="float-icon float-one">
              <ActionIcon category="plants" size={29} />
            </div>
            <div className="float-icon float-two">
              <ActionIcon category="cycling" size={33} />
            </div>
            <div className="float-icon float-three">
              <ActionIcon category="cooking" size={27} />
            </div>
            <div className="intro-note">
              {language === "en" ? (
                <>
                  A city full of people.
                  <br />A world of little possibilities.
                </>
              ) : (
                <>
                  Eine Stadt voller Menschen.
                  <br />
                  So viele kleine Möglichkeiten.
                </>
              )}
              <ArrowDown size={18} />
            </div>
          </div>
        </section>
        <section id="discover" className="discovery" aria-label={t.cityLabel}>
          <div className="search-bar">
            <div className="search-field">
              <Search size={21} />
              <input
                aria-label={t.searchLabel}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
              />
              {query && (
                <button
                  className="icon-button"
                  aria-label={t.clear}
                  onClick={() => setQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="location-label">
              <MapPin size={18} />
              <span>München</span>
              <span className="location-radius">
                {language === "en" ? "Citywide" : "Stadtweit"}
              </span>
            </div>
            <label className="category-select">
              <SlidersHorizontal size={17} />
              <span className="sr-only">{t.category}</span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as Category | "all")
                }
              >
                <option value="all">{t.allCategories}</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {n.categories[item]}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
          <div className="filter-row">
            <div
              className="intention-filters"
              role="group"
              aria-label={t.filters}
            >
              <button
                className={`filter-chip all ${intention === "all" ? "active" : ""}`}
                aria-pressed={intention === "all"}
                onClick={() => setIntention("all")}
              >
                {t.all}
              </button>
              {intentions.map((item) => (
                <button
                  key={item}
                  className={`filter-chip ${item} ${intention === item ? "active" : ""}`}
                  aria-pressed={intention === item}
                  onClick={() =>
                    setIntention(intention === item ? "all" : item)
                  }
                >
                  <span className="color-dot" />
                  {n.intentions[item]}
                  {intention === item && <Check size={13} />}
                </button>
              ))}
            </div>
            <div
              className="view-toggle"
              role="group"
              aria-label={`${t.map} / ${t.list}`}
            >
              <button
                aria-pressed={view === "map"}
                className={view === "map" ? "active" : ""}
                onClick={() => setView("map")}
              >
                <MapIcon size={16} />
                {t.map}
              </button>
              <button
                aria-pressed={view === "list"}
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
              >
                <List size={17} />
                {t.list}
              </button>
            </div>
          </div>
          {demoData && (
            <p className="fallback-notice" role="status">
              {t.demoData}
            </p>
          )}
          {mapUnavailable && (
            <p className="fallback-notice" role="status">
              {t.mapError}
            </p>
          )}
          <div
            className={`explorer ${view === "list" ? "list-mode" : "map-mode"}`}
          >
            <div className="map-column">
              <MapCanvas
                listings={filtered}
                language={language}
                onSelect={select}
                onUnavailable={handleMapUnavailable}
              />
              <div className="map-legend">
                {intentions.map((item) => (
                  <span key={item} className={item}>
                    <span className="color-dot" />
                    {n.intentions[item]}
                  </span>
                ))}
              </div>
            </div>
            <div className="results">
              <div className="results-heading">
                <div>
                  <h2>
                    {t.nearby}
                    <span className="result-count">{filtered.length}</span>
                  </h2>
                  <p aria-live="polite">
                    {filtered.length} {t.results}
                  </p>
                </div>
                {activeFilters ? (
                  <button className="text-button" onClick={clear}>
                    {t.clear}
                  </button>
                ) : (
                  <ArrowDown size={18} />
                )}
              </div>
              <div className="results-scroll">
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <Search size={32} />
                    <h3>{t.noResults}</h3>
                    <p>{t.noResultsText}</p>
                    <button className="secondary" onClick={clear}>
                      {t.clear}
                    </button>
                  </div>
                ) : (
                  filtered.map((listing) => (
                    <button
                      className="listing-card"
                      key={listing.id}
                      onClick={() => select(listing)}
                    >
                      <div className="card-top">
                        <span className={`action-tile ${listing.intention}`}>
                          <ActionIcon category={listing.category} size={23} />
                        </span>
                        <span
                          className={`intention-badge ${listing.intention}`}
                        >
                          <span className="color-dot" />
                          {n.intentions[listing.intention]}
                        </span>
                        <ArrowUpRight className="card-arrow" size={17} />
                      </div>
                      <h3>{listing.title}</h3>
                      <p className="card-location">
                        <MapPin size={13} />
                        {listing.neighborhood}
                        <span>·</span>
                        {n.categories[listing.category]}
                      </p>
                      <div className="card-bottom">
                        <span>
                          <Clock3 size={13} />
                          {availabilityText(listing.availability, language)}
                        </span>
                        <span className="compensation-mini">
                          {compensationText(listing, language)}
                        </span>
                      </div>
                      {pending.has(listing.id) && (
                        <span className="pending-mini">
                          <CheckCheck size={13} />
                          {t.pending}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="demo-banner">
          <span className="demo-label">
            <Sparkles size={15} />
            DEMO
          </span>
          <span>
            <strong>{t.demo}</strong> {t.demoNote}
          </span>
          <HeartHandshake size={20} />
        </div>
      </main>
      <footer>
        <span>machmaso.</span>
        <p>{t.local}</p>
        <span>MÜNCHEN · 2026</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {t[notice]}
          <button
            className="icon-button"
            aria-label={t.close}
            onClick={() => setNotice(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {selected && !dialog && (
        <Modal
          title={selected.title}
          closeLabel={t.close}
          onClose={() => setSelected(null)}
          kind="detail-panel"
        >
          <div className={`detail-art ${selected.intention}`}>
            <ActionIcon category={selected.category} size={82} />
            <span className="art-orbit" />
            <span className="art-dot" />
          </div>
          <div className="detail-body">
            <div className="detail-meta">
              <span className={`intention-badge ${selected.intention}`}>
                <span className="color-dot" />
                {n.intentions[selected.intention]}
              </span>
              <span className="muted">{n.categories[selected.category]}</span>
            </div>
            <h2>{selected.title}</h2>
            <p className="detail-description">{selected.description}</p>
            <div className="detail-fact">
              <MapPin size={19} />
              <div>
                <h3>{selected.neighborhood}</h3>
                <p>{t.approximate}</p>
              </div>
            </div>
            <div className="detail-fact">
              <Clock3 size={19} />
              <div>
                <h3>{t.availability}</h3>
                <p>{availabilityText(selected.availability, language)}</p>
                <small>{t.timezone}</small>
              </div>
            </div>
            <div className="detail-fact">
              <Coffee size={19} />
              <div>
                <h3>{t.compensation}</h3>
                <p>{compensationText(selected, language)}</p>
              </div>
            </div>
            {selected.intention === "exchange" && (
              <div className="exchange-box">
                <h3>{t.offer}</h3>
                <p>{selected.offer}</p>
                <h3>{t.wanted}</h3>
                <p>{selected.wanted}</p>
              </div>
            )}
            <div className="author">
              <span className="avatar">
                {selected.own ? t.yours[0] : selected.author[0]}
              </span>
              <div>
                <span>
                  {t.by}{" "}
                  <strong>{selected.own ? t.yours : selected.author}</strong>
                </span>
                <small>
                  {selected.own
                    ? t.own
                    : selected.fictional
                      ? t.fictional
                      : t.member}
                </small>
              </div>
            </div>
            <button
              className="primary full"
              disabled={pending.has(selected.id) || selected.own}
              onClick={() => setDialog("request")}
            >
              {selected.own ? (
                t.own
              ) : pending.has(selected.id) ? (
                <>
                  <CheckCheck size={18} />
                  {t.pending}
                </>
              ) : (
                <>
                  {t.request}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <p className="request-footnote">{t.requestDisclaimer}</p>
          </div>
        </Modal>
      )}
      {dialog === "post" && (
        <Modal
          title={t.newTitle}
          closeLabel={t.close}
          onClose={() => setDialog(null)}
          kind="post-modal"
        >
          <PostForm language={language} onPosted={posted} />
        </Modal>
      )}
      {dialog === "auth" && (
        <Modal
          title={t.authTitle}
          closeLabel={t.close}
          onClose={() => setDialog(null)}
          kind="post-modal"
        >
          {authAvailable ? (
            <AuthForm
              language={language}
              onSignedIn={() => setDialog("post")}
            />
          ) : (
            <div className="confirmation">
              <h2>{t.authTitle}</h2>
              <p role="status">{t.authNeeded}</p>
              <button className="primary full" onClick={() => setDialog(null)}>
                {t.done}
              </button>
            </div>
          )}
        </Modal>
      )}
      {dialog === "request" && selected && (
        <Modal
          title={t.requestTitle}
          closeLabel={t.close}
          onClose={() => setDialog(null)}
        >
          <div className="request-content">
            <span className="request-symbol">
              <HeartHandshake size={30} />
            </span>
            <h2>{t.requestTitle}</h2>
            <p className="muted">{t.requestIntro}</p>
            <div className="request-target">
              <ActionIcon category={selected.category} />
              <strong>{selected.title}</strong>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPending((current) => new Set(current).add(selected.id));
                setDialog("confirmation");
              }}
            >
              <label>
                {t.introduction}
                <textarea
                  name="introduction"
                  rows={4}
                  maxLength={500}
                  placeholder={t.introPlaceholder}
                />
              </label>
              <p className="preview-note">{t.requestDisclaimer}</p>
              <button className="primary full">
                {t.submitRequest}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </Modal>
      )}
      {dialog === "confirmation" && (
        <Modal
          title={t.confirmed}
          closeLabel={t.close}
          onClose={() => setDialog(null)}
        >
          <div className="confirmation">
            <span className="request-symbol">
              <CheckCheck size={34} />
            </span>
            <h2>{t.confirmed}</h2>
            <p>{t.confirmationText}</p>
            <button className="primary full" onClick={() => setDialog(null)}>
              {t.done}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
