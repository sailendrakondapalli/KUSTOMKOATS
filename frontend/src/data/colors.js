// Kustom Koats Color Catalog Data
// Source: Kustom Koats Brochure - Actual Colors

export const SOLID_PEARLS = [
  "24 Karat Gold", "Adamantium", "Amber Yellow", "Aurum Dust", "Balloon White",
  "Black Cherry", "Blue Dream", "Blurple", "Bordeaux", "Brass Knuckles",
  "Brilliant Bronze", "Bronzite Metal Pearl", "Brooklyn Gold", "Burnt Orange",
  "Cali Purple", "Canyon Cavalier Bronze", "Coral Green", "Corona Yellow",
  "Cotton Candy Blue", "Deep Sea Blue", "Double Shot Espresso", "Electric Blurple",
  "English Lavender", "Flamingo", "Galapagos Green", "Gandom", "Grape Soda",
  "Green Lantern", "Gulf Blue", "Himalayan White", "HKS Purple", "Hot Pink",
  "Hyper Black", "Hyper Silver", "Iguana Green", "Kopi", "Laver",
  "Liberty Copper Metal Pearl", "Mariana Blue", "Medium Rare", "Merlot Red",
  "Miami Sunset", "Mineral Glacier", "Mocha Brown", "Moissanite", "Mojave",
  "Moonstone Pink", "Moss Green", "Mulberry", "Muscadine", "Mystic Green",
  "Nebula Blue", "Nebula Green", "Nebula Purple", "Nebula Red", "Nebula Yellow",
  "Nighthawk Black", "Nixon Gold Metal Pearl", "Ocean Blue", "Penny Copper",
  "Peppermint", "Peridot", "Phantom Red", "Pink Lemonade", "Polaris Fluorescent Yellow",
  "PurPlue", "Radiant Red", "Radioactive Green", "Raw Titanium", "Real Red",
  "Red Rum", "Rhino", "Ron Burgundy", "Rose Copper", "Royal Gold",
  "Ruby Red Metal Pearl", "Sakhir Red", "Saphire Blue", "Saturn Yellow",
  "Sazuka Blue", "Seafoam Green", "Slipstream Punisher", "Solar Flare", "Sparkling Graphite",
  "Sprint Blue", "Stainless Steel Metal Pearl", "Stark Red Metal Pearl", "Steel Blue",
  "Summer Peach", "Sunshine Gold", "Swamp Land Green", "Tahitian Green", "Tangerine Sky",
  "Techno Purple", "Tiff Blue", "Top Secret Gold", "Tupelo", "Tuzi Indigo",
  "Underground Punisher", "Wild Rose", "World Rally Blue", "Wu-Tang Yellow", "Yas Marina Blue",
  "Yellow Submarine"
]

export const INTERFERENCE_PEARLS = [
  "Abalone", "Dove Blue", "Gremlin Green", "Hawaiian Coral", "Iceberg Blue",
  "Interference Blue", "Interference Gold", "Interference Green", "Interference Purple",
  "Martian Green", "Martian Red", "Martian Violet", "Prometheus Purple"
]

export const CARBON_PEARLS = [
  "Carbon Blue", "Carbon Bronze", "Carbon Gold", "Carbon Green",
  "Carbon Lava", "Carbon Orange", "Carbon Red", "Carbon Silver"
]

export const OEM_PLUS_PEARLS = [
  "Canary Yellow", "Cardinal Red", "Concord Purple", "Egyptian Blue OEM+",
  "French Blue OEM+", "Imperial Purple", "Obsidian Black", "Porcelain White",
  "Racing Green"
]

export const SPECIAL_EFFECT_PEARLS = [
  "Aegean Allure", "Alpha Nano", "Sandstone", "Terra Orange", "Topaz Blue"
]

export const CHROMA_PEARLS = [
  "Andromeda", "Anthias", "Aqua-Violet", "Arya", "Balkan",
  "Barbados Blue", "Beta Nano", "Black Hole", "BlueGill", "Bondi",
  "Bora Bora", "Calypso", "Casablanca", "Caspian Gold Blue", "Casper",
  "Cobra", "Cosmic Crush", "Cotton Candy", "Delta Nano", "Emporis",
  "Europa", "Fiji", "Flash", "Galaxy", "Genesis",
  "Helios", "Hydra", "Iris-Violet", "Jedi", "Kepler",
  "Khalifa", "Komodo", "Kranberry", "Krown Royale", "Lambda Nano",
  "Lemon Lime", "Lunar", "Lynx", "Mardi Gras", "Monsoon",
  "Mriya", "Niagara", "Olive Blueberry", "Olive Gold", "Omega Nano",
  "Omicron Nano", "Phoenix", "Punch", "Reptile Flip", "Rose Gold",
  "Sahara", "Sentinel", "Shiraz", "Sigma Nano", "Sockeye",
  "Theta Nano", "Triton", "Tuscan", "Vanguard", "Vero",
  "Worm Hole", "Zeta Nano", "Zombie Midnight"
]

// Helper function to get all colors by category
export function getColorsByCategory(category) {
  const categoryMap = {
    "Solid Pearls": SOLID_PEARLS,
    "Interference Pearls": INTERFERENCE_PEARLS,
    "Carbon Pearls": CARBON_PEARLS,
    "OEM+ Pearls": OEM_PLUS_PEARLS,
    "Special Effect Pearls": SPECIAL_EFFECT_PEARLS,
    "Chroma Pearls": CHROMA_PEARLS
  }
  return categoryMap[category] || []
}

// Get all colors
export function getAllColors() {
  return [
    ...SOLID_PEARLS,
    ...INTERFERENCE_PEARLS,
    ...CARBON_PEARLS,
    ...OEM_PLUS_PEARLS,
    ...SPECIAL_EFFECT_PEARLS,
    ...CHROMA_PEARLS
  ]
}

// Search colors by name
export function searchColors(query) {
  if (!query) return getAllColors()
  const lowerQuery = query.toLowerCase()
  return getAllColors().filter(color => 
    color.toLowerCase().includes(lowerQuery)
  )
}

// Get category for a color name
export function getCategoryForColor(colorName) {
  if (SOLID_PEARLS.includes(colorName)) return "Solid Pearls"
  if (INTERFERENCE_PEARLS.includes(colorName)) return "Interference Pearls"
  if (CARBON_PEARLS.includes(colorName)) return "Carbon Pearls"
  if (OEM_PLUS_PEARLS.includes(colorName)) return "OEM+ Pearls"
  if (SPECIAL_EFFECT_PEARLS.includes(colorName)) return "Special Effect Pearls"
  if (CHROMA_PEARLS.includes(colorName)) return "Chroma Pearls"
  return null
}
