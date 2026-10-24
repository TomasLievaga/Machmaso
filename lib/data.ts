export type Language = "en" | "de";
export const intentions = [
  "looking",
  "offering",
  "together",
  "exchange",
] as const;
export type Intention = (typeof intentions)[number];
export const categories = [
  "tennis",
  "plants",
  "cooking",
  "moving",
  "drawing",
  "languages",
  "cycling",
  "diy",
] as const;
export type Category = (typeof categories)[number];
export const compensationTypes = ["free", "coffee", "mutual", "paid"] as const;
export type Compensation = (typeof compensationTypes)[number];
export type Availability =
  | { mode: "date"; date: string; start?: string; end?: string }
  | { mode: "recurring"; days: number[]; start: string; end: string }
  | { mode: "arrangement" };
export type Listing = {
  id: string;
  title: string;
  description: string;
  intention: Intention;
  category: Category;
  neighborhood: string;
  lat: number;
  lng: number;
  author: string;
  availability: Availability;
  compensation: Compensation;
  amount?: number;
  unit?: "hour" | "session";
  offer?: string;
  wanted?: string;
  own?: boolean;
  // Sample listings that do not belong to a real account.
  fictional?: boolean;
};
export const neighborhoods = [
  { name: "Maxvorstadt", lat: 48.1508, lng: 11.5706 },
  { name: "Schwabing", lat: 48.1665, lng: 11.5869 },
  { name: "Glockenbachviertel", lat: 48.1262, lng: 11.5695 },
  { name: "Haidhausen", lat: 48.1309, lng: 11.6028 },
  { name: "Neuhausen", lat: 48.1553, lng: 11.5354 },
  { name: "Sendling", lat: 48.1172, lng: 11.5397 },
  { name: "Lehel", lat: 48.1424, lng: 11.5923 },
  { name: "Westend", lat: 48.1356, lng: 11.5358 },
];
export const names = {
  en: {
    intentions: {
      looking: "Looking for",
      offering: "Offering",
      together: "Together",
      exchange: "Exchange",
    },
    categories: {
      tennis: "Tennis",
      plants: "Plants",
      cooking: "Cooking",
      moving: "Moving help",
      drawing: "Drawing",
      languages: "Languages",
      cycling: "Cycling",
      diy: "DIY",
    },
    compensation: {
      free: "Free",
      coffee: "For a coffee",
      mutual: "Mutual help",
      paid: "Paid",
    },
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  de: {
    intentions: {
      looking: "Gesucht",
      offering: "Angebot",
      together: "Zusammen",
      exchange: "Tausch",
    },
    categories: {
      tennis: "Tennis",
      plants: "Pflanzen",
      cooking: "Kochen",
      moving: "Umzugshilfe",
      drawing: "Zeichnen",
      languages: "Sprachen",
      cycling: "Radfahren",
      diy: "Heimwerken",
    },
    compensation: {
      free: "Kostenlos",
      coffee: "Für einen Kaffee",
      mutual: "Gegenseitige Hilfe",
      paid: "Bezahlt",
    },
    weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  },
};
// Date-only values stay calendar strings. No local/UTC conversion is involved.
export function berlinToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function futureDate(days: number) {
  const [year, month, day] = berlinToday().split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}
export function availabilityText(value: Availability, lang: Language) {
  const time =
    value.mode !== "arrangement" && value.start
      ? ` · ${value.start}${value.end ? `–${value.end}` : ""}`
      : "";
  if (value.mode === "arrangement")
    return lang === "en" ? "By arrangement" : "Nach Absprache";
  if (value.mode === "recurring")
    return `${lang === "en" ? "Every" : "Jeden"} ${value.days.map((day) => names[lang].weekdays[day]).join(", ")}${time}`;
  const [year, month, day] = value.date.split("-").map(Number);
  return (
    new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-DE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day))) + time
  );
}
export function compensationText(listing: Listing, lang: Language) {
  if (listing.compensation !== "paid")
    return names[lang].compensation[listing.compensation];
  return `${names[lang].compensation.paid} · €${listing.amount} / ${listing.unit === "hour" ? (lang === "en" ? "hour" : "Stunde") : lang === "en" ? "session" : "Termin"}`;
}
export function createSamples(): Listing[] {
  const rows: [
    string,
    string,
    Intention,
    Category,
    number,
    string,
    Compensation,
  ][] = [
    [
      "A relaxed rally after work?",
      "Looking for a friendly tennis partner. I’m a little rusty, so a few good rallies and a laugh are the goal. Bring your racket; we can choose a public court together.",
      "together",
      "tennis",
      1,
      "Lena",
      "free",
    ],
    [
      "A few cuttings, a little more green",
      "My pothos has outgrown its windowsill. I have rooted cuttings ready for a new home and can share a few easy care tips.",
      "offering",
      "plants",
      0,
      "Jonas",
      "coffee",
    ],
    [
      "Help my sofa find its new home",
      "Could use an extra pair of hands to carry a small sofa down one flight of stairs. We’ll arrange a meeting point nearby. About 45 minutes of help.",
      "looking",
      "moving",
      2,
      "Mila",
      "paid",
    ],
    [
      "Your German, my homemade pasta",
      "I’m learning German and love cooking. Let’s make dinner and practise chatting, with plenty of time for questions and second helpings.",
      "exchange",
      "languages",
      3,
      "Luca",
      "mutual",
    ],
    [
      "Sunday sketchbook club",
      "Bring any sketchbook and join a slow afternoon drawing buildings, trees, or whatever catches your eye. All abilities welcome.",
      "together",
      "drawing",
      6,
      "Sophie",
      "free",
    ],
    [
      "Let’s roll along the Isar",
      "An easy-paced cycle along the river, with a stop for coffee. Around 15 km, no racing and nobody left behind. Bring your own bike.",
      "together",
      "cycling",
      2,
      "Felix",
      "free",
    ],
    [
      "A second pair of hands for a shelf",
      "I have the shelf and tools, but would love help measuring and mounting it. A small weekend DIY project with plenty of coffee.",
      "looking",
      "diy",
      4,
      "Nora",
      "coffee",
    ],
    [
      "Learn to fold little dumplings",
      "I’d love to share my family’s vegetable dumpling recipe with a small group. We can agree on ingredients and dietary needs before meeting.",
      "offering",
      "cooking",
      7,
      "Mei",
      "paid",
    ],
    [
      "Plant care for a weekend away",
      "Looking for someone nearby to water a few balcony plants while I’m away. Happy to return the favour when you travel.",
      "looking",
      "plants",
      5,
      "Ben",
      "mutual",
    ],
    [
      "Bike tune-up for a drawing lesson",
      "I enjoy fixing bikes and can help with a basic check of tyres and chain. In return, I’d love to learn the basics of drawing faces.",
      "exchange",
      "cycling",
      4,
      "Amir",
      "mutual",
    ],
    [
      "Beginner tennis, zero pressure",
      "Just starting out? Me too. Let’s practise serves and learn together at a nearby court. We can split any court booking costs separately.",
      "looking",
      "tennis",
      6,
      "Hanna",
      "free",
    ],
    [
      "A little German, a little English",
      "A relaxed conversation walk through Schwabing. We’ll switch between German and English and help each other find the words.",
      "together",
      "languages",
      1,
      "Oskar",
      "free",
    ],
    [
      "Borrow my drill for your project",
      "My cordless drill is mostly sitting in its box. Happy to lend it for a small project and show you how it works.",
      "offering",
      "diy",
      5,
      "Clara",
      "free",
    ],
    [
      "Soup recipes for balcony herbs",
      "I make a lovely seasonal soup and would like to swap a recipe and a portion for a few fresh herbs from your balcony.",
      "exchange",
      "cooking",
      0,
      "Ella",
      "mutual",
    ],
    [
      "Moving boxes, ready for round two",
      "Eight sturdy cardboard boxes from my recent move. Flattened and ready to collect at an agreed neighborhood meeting point.",
      "offering",
      "moving",
      7,
      "David",
      "free",
    ],
    [
      "Draw the city over a coffee",
      "An informal urban sketching meet-up. We’ll find a quiet café, pick a view, and draw for an hour. Bring whatever materials you have.",
      "together",
      "drawing",
      3,
      "Ida",
      "coffee",
    ],
  ];
  return rows.map(
    (
      [title, description, intention, category, index, author, compensation],
      i,
    ) => ({
      id: `sample-${i}`,
      title,
      description,
      intention,
      category,
      ...neighborhoods[index],
      neighborhood: neighborhoods[index].name,
      lat: neighborhoods[index].lat + (i > 7 ? 0.003 : 0),
      lng: neighborhoods[index].lng + (i > 7 ? -0.004 : 0),
      author,
      fictional: true,
      compensation,
      availability:
        i % 3 === 0
          ? {
              mode: "recurring",
              days: i % 2 === 0 ? [2, 4] : [5],
              start: "17:30",
              end: "19:00",
            }
          : i % 3 === 1
            ? { mode: "arrangement" }
            : {
                mode: "date",
                date: futureDate(i + 3),
                start: "14:00",
                end: "16:00",
              },
      ...(compensation === "paid"
        ? { amount: i === 2 ? 20 : 12, unit: "session" as const }
        : {}),
      ...(intention === "exchange"
        ? {
            offer:
              i === 3
                ? "A homemade pasta lesson and dinner."
                : i === 9
                  ? "A basic bike tune-up."
                  : "A seasonal soup recipe and a portion to enjoy.",
            wanted:
              i === 3
                ? "Friendly German conversation practice."
                : i === 9
                  ? "A beginner lesson in drawing faces."
                  : "A small bunch of fresh balcony herbs.",
          }
        : {}),
    }),
  );
}
