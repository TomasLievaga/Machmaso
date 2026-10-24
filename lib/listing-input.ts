import {
  categories,
  compensationTypes,
  intentions,
  neighborhoods,
  type Availability,
  type Category,
  type Compensation,
  type Intention,
} from "./data";

// Raw values from the post form. Treated as untrusted on the server.
export type ListingInput = {
  title: string;
  description: string;
  intention: string;
  category: string;
  neighborhood: string;
  mode: string;
  date: string;
  start: string;
  end: string;
  days: number[];
  compensation: string;
  amount: string;
  unit: string;
  offer: string;
  wanted: string;
};

// The validated listing, minus everything the server derives (id, author).
export type ListingDraft = {
  title: string;
  description: string;
  intention: Intention;
  category: Category;
  neighborhood: string;
  lat: number;
  lng: number;
  availability: Availability;
  compensation: Compensation;
  amount?: number;
  unit?: "hour" | "session";
  offer?: string;
  wanted?: string;
};

export type ListingInputError =
  "required" | "length" | "days" | "date" | "time" | "amount" | "invalid";

export const limits = { title: 90, description: 1200, exchange: 500 };

// Counts code points, like Postgres char_length.
const length = (value: string) => Array.from(value).length;
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const oneOf = <T extends string>(list: readonly T[], value: unknown) =>
  list.find((item) => item === value);
const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value;
}

function parseAvailability(
  input: Record<string, unknown>,
  today: string,
): Availability | ListingInputError {
  const mode = input.mode;
  if (mode === "arrangement") return { mode };
  const start = text(input.start);
  const end = text(input.end);
  if ((start && !isTime(start)) || (end && !isTime(end))) return "time";
  if (mode === "recurring") {
    const days = Array.isArray(input.days) ? input.days : [];
    const valid = days.every(
      (day) => Number.isInteger(day) && day >= 0 && day <= 6,
    );
    if (!valid) return "invalid";
    const unique = [...new Set(days as number[])].sort();
    if (unique.length === 0) return "days";
    if (!start || !end || end <= start) return "time";
    return { mode, days: unique, start, end };
  }
  if (mode === "date") {
    const date = text(input.date);
    if (!isCalendarDate(date) || date <= today) return "date";
    if (!!start !== !!end || (start && end <= start)) return "time";
    return start ? { mode, date, start, end } : { mode, date };
  }
  return "invalid";
}

// Validates everything the browser sends. `today` is the Berlin calendar date.
export function parseListingInput(
  raw: unknown,
  today: string,
): { ok: true; draft: ListingDraft } | { ok: false; error: ListingInputError } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "invalid" };
  const input = raw as Record<string, unknown>;
  const title = text(input.title);
  const description = text(input.description);
  const intention = oneOf(intentions, input.intention);
  const category = oneOf(categories, input.category);
  const compensation = oneOf(compensationTypes, input.compensation);
  const location = neighborhoods.find(
    (item) => item.name === input.neighborhood,
  );
  if (!intention || !category || !compensation || !location)
    return { ok: false, error: "invalid" };
  if (!title || !description) return { ok: false, error: "required" };
  if (length(title) > limits.title || length(description) > limits.description)
    return { ok: false, error: "length" };

  let exchange: { offer?: string; wanted?: string } = {};
  if (intention === "exchange") {
    const offer = text(input.offer);
    const wanted = text(input.wanted);
    if (!offer || !wanted) return { ok: false, error: "required" };
    if (length(offer) > limits.exchange || length(wanted) > limits.exchange)
      return { ok: false, error: "length" };
    exchange = { offer, wanted };
  }

  const availability = parseAvailability(input, today);
  if (typeof availability === "string")
    return { ok: false, error: availability };

  let payment: { amount?: number; unit?: "hour" | "session" } = {};
  if (compensation === "paid") {
    const amountText = text(input.amount);
    const amount = Number(amountText);
    const unit = oneOf(["hour", "session"] as const, input.unit);
    if (
      !/^\d+(\.\d{1,2})?$/.test(amountText) ||
      amount < 0.01 ||
      amount > 10000 ||
      !unit
    )
      return { ok: false, error: "amount" };
    payment = { amount, unit };
  }

  return {
    ok: true,
    draft: {
      title,
      description,
      intention,
      category,
      neighborhood: location.name,
      lat: location.lat,
      lng: location.lng,
      availability,
      compensation,
      ...payment,
      ...exchange,
    },
  };
}
