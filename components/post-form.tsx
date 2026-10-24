"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
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
  type Category,
} from "@/lib/data";
import { copy } from "@/lib/i18n";
export default function PostForm({
  language,
  onPost,
}: {
  language: Language;
  onPost: (listing: Listing) => void;
}) {
  const t = copy[language];
  const n = names[language];
  const [intention, setIntention] = useState<Intention>("together");
  const [mode, setMode] = useState<Availability["mode"]>("arrangement");
  const [compensation, setCompensation] = useState<Compensation>("free");
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    setError("");
    if (
      !value("title") ||
      !value("description") ||
      (intention === "exchange" && (!value("offer") || !value("wanted")))
    ) {
      setError(t.errorText);
      return;
    }
    if (mode === "recurring" && days.length === 0) {
      setError(t.errorDays);
      return;
    }
    if (mode === "date" && value("date") <= berlinToday()) {
      setError(t.errorDate);
      return;
    }
    const start = value("start");
    const end = value("end");
    if (
      mode !== "arrangement" &&
      (!!start !== !!end || (start && end <= start))
    ) {
      setError(t.errorTime);
      return;
    }
    const location = neighborhoods[Number(value("location"))];
    const availability: Availability =
      mode === "arrangement"
        ? { mode }
        : mode === "recurring"
          ? { mode, days: [...days].sort(), start, end }
          : {
              mode,
              date: value("date"),
              start: start || undefined,
              end: end || undefined,
            };
    onPost({
      id: crypto.randomUUID(),
      title: value("title"),
      description: value("description"),
      intention,
      category: value("category") as Category,
      lat: location.lat,
      lng: location.lng,
      neighborhood: location.name,
      author: "You",
      own: true,
      availability,
      compensation,
      ...(compensation === "paid"
        ? {
            amount: Number(value("amount")),
            unit: value("unit") as "hour" | "session",
          }
        : {}),
      ...(intention === "exchange"
        ? { offer: value("offer"), wanted: value("wanted") }
        : {}),
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
          maxLength={90}
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
          maxLength={1200}
          rows={3}
          placeholder={t.descriptionPlaceholder}
        />
      </label>
      <label>
        {t.location}
        <select name="location">
          {neighborhoods.map((location, index) => (
            <option key={location.name} value={index}>
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
            <textarea name="offer" required rows={2} maxLength={500} />
          </label>
          <label>
            {t.wanted}
            <textarea name="wanted" required rows={2} maxLength={500} />
          </label>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="preview-note">{t.previewNote}</p>
      <button className="primary full" type="submit">
        {t.create}
        <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
