"use client";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { createListing } from "@/app/actions";
import {
  categories,
  intentions,
  compensationTypes,
  neighborhoods,
  names,
  futureDate,
  berlinToday,
  type Availability,
  type Intention,
  type Compensation,
  type Language,
  type Listing,
} from "@/lib/data";
import { copy } from "@/lib/i18n";
import {
  limits,
  parseListingInput,
  type ListingInput,
} from "@/lib/listing-input";
export default function PostForm({
  language,
  onPosted,
}: {
  language: Language;
  onPosted: (listing: Listing) => void;
}) {
  const t = copy[language];
  const n = names[language];
  const [intention, setIntention] = useState<Intention>("together");
  const [mode, setMode] = useState<Availability["mode"]>("arrangement");
  const [compensation, setCompensation] = useState<Compensation>("free");
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();
  const messages = {
    required: t.errorText,
    length: t.errorLength,
    days: t.errorDays,
    date: t.errorDate,
    time: t.errorTime,
    amount: t.errorAmount,
    invalid: t.errorInvalid,
    auth: t.errorAuth,
    unavailable: t.errorUnavailable,
    failed: t.errorFailed,
  };
  function submit(event: FormEvent<HTMLFormElement>) {
    // Calling the action manually (not via the form action prop) keeps every
    // typed value in place when saving fails.
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "");
    const input: ListingInput = {
      title: value("title"),
      description: value("description"),
      intention,
      category: value("category"),
      neighborhood: value("location"),
      mode,
      date: value("date"),
      start: value("start"),
      end: value("end"),
      days,
      compensation,
      amount: value("amount"),
      unit: value("unit"),
      offer: value("offer"),
      wanted: value("wanted"),
    };
    setError("");
    // Same checks as the server, for immediate feedback.
    const local = parseListingInput(input, berlinToday());
    if (!local.ok) {
      setError(messages[local.error]);
      return;
    }
    startTransition(async () => {
      try {
        const result = await createListing(input);
        if (result.ok) onPosted(result.listing);
        else setError(messages[result.error]);
      } catch {
        setError(messages.failed);
      }
    });
  }
  return (
    <form className="post-form" onSubmit={submit}>
      <span className="eyebrow">
        MACHMASO / {language === "en" ? "YOUR IDEA" : "DEINE IDEE"}
      </span>
      <h2>{t.newTitle}</h2>
      <p className="muted form-intro">{t.newIntro}</p>
      <fieldset>
        <legend>{t.intention}</legend>
        <div className="intention-options">
          {intentions.map((item) => (
            <label
              key={item}
              className={`intention-option ${item} ${intention === item ? "chosen" : ""}`}
            >
              <input
                type="radio"
                name="intention"
                value={item}
                checked={intention === item}
                onChange={() => setIntention(item)}
              />
              <span className="color-dot" />
              {n.intentions[item]}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        {t.title}
        <input
          name="title"
          required
          maxLength={limits.title}
          placeholder={t.titlePlaceholder}
        />
      </label>
      <label>
        {t.category}
        <select name="category">
          {categories.map((category) => (
            <option key={category} value={category}>
              {n.categories[category]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t.description}
        <textarea
          name="description"
          required
          maxLength={limits.description}
          rows={3}
          placeholder={t.descriptionPlaceholder}
        />
      </label>
      <label>
        {t.location}
        <select name="location">
          {neighborhoods.map((location) => (
            <option key={location.name} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <p className="field-hint">
        <MapPin size={14} />
        {t.approximate}
      </p>
      <label>
        {t.availabilityMode}
        <select
          value={mode}
          onChange={(event) =>
            setMode(event.target.value as Availability["mode"])
          }
        >
          <option value="arrangement">{t.arrangement}</option>
          <option value="date">{t.specific}</option>
          <option value="recurring">{t.recurring}</option>
        </select>
      </label>
      {mode === "date" && (
        <label>
          {t.date}
          <input
            type="date"
            name="date"
            required
            min={futureDate(1)}
            defaultValue={futureDate(7)}
          />
        </label>
      )}
      {mode === "recurring" && (
        <fieldset>
          <legend>{t.weekdays}</legend>
          <div className="weekdays">
            {n.weekdays.map((day, index) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={days.includes(index)}
                  onChange={(event) =>
                    setDays(
                      event.target.checked
                        ? [...days, index]
                        : days.filter((day) => day !== index),
                    )
                  }
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {mode !== "arrangement" && (
        <>
          <div className="form-row">
            <label>
              {t.start}
              {mode === "date" ? ` (${t.optional})` : ""}
              <input type="time" name="start" required={mode === "recurring"} />
            </label>
            <label>
              {t.end}
              {mode === "date" ? ` (${t.optional})` : ""}
              <input type="time" name="end" required={mode === "recurring"} />
            </label>
          </div>
          <p className="field-hint">{t.timezone}</p>
        </>
      )}
      <label>
        {t.compensation}
        <select
          value={compensation}
          onChange={(event) =>
            setCompensation(event.target.value as Compensation)
          }
        >
          {compensationTypes.map((item) => (
            <option key={item} value={item}>
              {n.compensation[item]}
            </option>
          ))}
        </select>
      </label>
      {compensation === "paid" && (
        <div className="form-row">
          <label>
            {t.amount}
            <input
              name="amount"
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              required
            />
          </label>
          <label>
            {t.unit}
            <select name="unit">
              <option value="hour">{t.hour}</option>
              <option value="session">{t.session}</option>
            </select>
          </label>
        </div>
      )}
      {intention === "exchange" && (
        <>
          <label>
            {t.offer}
            <textarea
              name="offer"
              required
              rows={2}
              maxLength={limits.exchange}
            />
          </label>
          <label>
            {t.wanted}
            <textarea
              name="wanted"
              required
              rows={2}
              maxLength={limits.exchange}
            />
          </label>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="preview-note">{t.previewNote}</p>
      <button className="primary full" type="submit" disabled={busy}>
        {busy ? t.working : t.create}
        {!busy && <ArrowUpRight size={18} />}
      </button>
    </form>
  );
}
