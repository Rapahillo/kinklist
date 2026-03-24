export interface PropCategory {
  category: string;
  props: string[];
}

export const propSuggestions: PropCategory[] = [
  {
    category: "Toys",
    props: [
      "vibrator",
      "dildo",
      "plug",
      "wand",
      "cock ring",
      "strap-on",
      "clamps",
      "paddle",
      "flogger",
      "crop",
      "cane",
      "pinwheel",
      "wartenberg wheel",
    ],
  },
  {
    category: "Restraints",
    props: [
      "handcuffs",
      "rope",
      "bondage tape",
      "spreader bar",
      "collar",
      "leash",
      "ankle cuffs",
      "armbinder",
      "hogtie",
      "zip ties",
      "leather cuffs",
    ],
  },
  {
    category: "Sensory",
    props: [
      "blindfold",
      "earplugs",
      "headphones",
      "ice",
      "candle wax",
      "feather",
      "massage oil",
      "lube",
      "gloves",
    ],
  },
  {
    category: "Clothing & Outfits",
    props: [
      "lingerie",
      "corset",
      "harness",
      "heels",
      "stockings",
      "latex",
      "leather outfit",
      "uniform",
      "collar",
      "gag",
      "hood",
      "mask",
    ],
  },
  {
    category: "Furniture",
    props: [
      "bench",
      "spanking bench",
      "sex swing",
      "St. Andrew's cross",
      "bed restraints",
      "pillow",
      "wedge",
    ],
  },
  {
    category: "Consumables",
    props: [
      "lube",
      "massage oil",
      "body paint",
      "whipped cream",
      "chocolate sauce",
    ],
  },
  {
    category: "Safety & Aftercare",
    props: [
      "safeword card",
      "blanket",
      "water",
      "snacks",
      "first aid kit",
      "scissors (safety)",
      "EMT shears",
      "aftercare kit",
    ],
  },
];

export const allPropSuggestions: string[] = propSuggestions.flatMap(
  (c) => c.props
);

export function searchPropSuggestions(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return allPropSuggestions.filter((p) => p.toLowerCase().includes(q));
}
