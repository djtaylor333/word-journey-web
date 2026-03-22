/**
 * Curated word lists for seasonal themed level packs.
 * 100 levels per season, ordered easy → hard.
 * All words are exactly 5 letters. All 600 words are unique across the entire file.
 * Ported 1-to-1 from the Android SeasonalWordPacks.kt.
 */

export type SeasonKey = 'easter' | 'valentines' | 'summer' | 'halloween' | 'thanksgiving' | 'christmas';

export interface SeasonMeta {
  key: SeasonKey;
  label: string;
  emoji: string;
  /** Tailwind/CSS colour for the accent */
  accent: string;
  /** Rough active date range hint */
  dateHint: string;
}

export const SEASON_META: Record<SeasonKey, SeasonMeta> = {
  easter:       { key: 'easter',       label: 'Easter & Spring', emoji: '🐣', accent: '#86EFAC', dateHint: 'Mar–Apr' },
  valentines:   { key: 'valentines',   label: "Valentine's Day",  emoji: '💝', accent: '#F9A8D4', dateHint: 'Feb 1–14' },
  summer:       { key: 'summer',       label: 'Summer',           emoji: '☀️', accent: '#FDE68A', dateHint: 'Jun–Aug' },
  halloween:    { key: 'halloween',    label: 'Halloween',        emoji: '🎃', accent: '#C084FC', dateHint: 'Oct' },
  thanksgiving: { key: 'thanksgiving', label: 'Thanksgiving',     emoji: '🦃', accent: '#FCA5A1', dateHint: 'Nov' },
  christmas:    { key: 'christmas',    label: 'Christmas',        emoji: '🎄', accent: '#6EE7B7', dateHint: 'Dec' },
};

export const SEASON_KEYS: SeasonKey[] = ['easter', 'valentines', 'summer', 'halloween', 'thanksgiving', 'christmas'];

// ── Easter & Spring ───────────────────────────────────────────────────────────
const EASTER_WORDS: string[] = [
  'BLOOM', 'CHICK', 'BUNNY', 'TULIP', 'ROBIN',
  'DOVES', 'LAMBS', 'LILAC', 'PETAL', 'SEEDS',
  'FRESH', 'GREEN', 'SUNNY', 'PANSY', 'DAISY',
  'VINES', 'STEMS', 'BIRDS', 'WORMS', 'RAINY',
  'WINDY', 'CLOUD', 'ARISE', 'RENEW', 'ALIVE',
  'LIGHT', 'GRACE', 'RISEN', 'CROSS', 'ANGEL',
  'CHOIR', 'PSALM', 'FAITH', 'BLESS', 'NESTS',
  'GROVE', 'CREEK', 'VIVID', 'BRISK', 'MUDDY',
  'MISTY', 'FLORA', 'FRUIT', 'PREEN', 'PERCH',
  'TWEET', 'CHEEP', 'BLEAT', 'GRAZE', 'AZURE',
  'BALMY', 'SPRIG', 'BOWER', 'ARBOR', 'THAWS',
  'RIPEN', 'SPAWN', 'GLORY', 'HYMNS', 'SPRAY',
  'PLUME', 'SPORE', 'THORN', 'TWIGS', 'WISPY',
  'WRENS', 'YOLKS', 'CROAK', 'FROGS', 'SWANS',
  'GEESE', 'HATCH', 'HARES', 'HERBS', 'HILLS',
  'PLOWS', 'PONDS', 'POOLS', 'PATCH', 'PALMS',
  'VIGIL', 'TEPID', 'SOGGY', 'FROND', 'EAGER',
  'CREED', 'DEITY', 'FOALS', 'PRAYS', 'VERSE',
  'VETCH', 'MOSSY', 'FILLY', 'LARKS', 'FINCH',
  'BOUGH', 'GLENS', 'TERNS', 'CRESS', 'CALLA',
];

// ── Valentine's Day ───────────────────────────────────────────────────────────
const VALENTINES_WORDS: string[] = [
  'HEART', 'LOVED', 'ROSES', 'SWEET', 'CANDY',
  'LOVER', 'BLUSH', 'SMILE', 'CHARM', 'GIFTS',
  'DATES', 'CUPID', 'ADORE', 'WINKS', 'FLIRT',
  'HONEY', 'FANCY', 'CHEEK', 'FLUSH', 'GIDDY',
  'PLUSH', 'SIGHS', 'ROUGE', 'TEDDY', 'BOXES',
  'ARDOR', 'TRYST', 'SWOON', 'DOTED', 'MOONY',
  'CRUSH', 'AMOUR', 'OGLED', 'WOOED', 'PINED',
  'CLUNG', 'CARES', 'TOAST', 'SATIN', 'SILKY',
  'BEADS', 'LACES', 'BOWED', 'BRAID', 'TIARA',
  'JEWEL', 'POSED', 'DOWRY', 'TROTH', 'SWEAR',
  'VOWED', 'LOYAL', 'TRULY', 'DEEDS', 'POEMS',
  'PROSE', 'LUTES', 'HARPS', 'SONGS', 'WALTZ',
  'DANCE', 'TANGO', 'SAMBA', 'MUSIC', 'TUNES',
  'IDYLL', 'ELOPE', 'YEARN', 'SWAIN', 'BELLE',
  'BUXOM', 'SPURN', 'JILTS', 'POUTS', 'TIFFS',
  'SULKS', 'SOPPY', 'MUSHY', 'GUSHY', 'TACKY',
  'GAUDY', 'DOTES', 'LEMAN', 'COURT', 'CAMEO',
  'BLISS', 'ELATE', 'MIRTH', 'LYRIC', 'CHORD',
  'DITTY', 'RHYME', 'METER', 'FETCH', 'RINGS',
  'OATHS', 'BONDS', 'VYING', 'CRAVE', 'BESOT',
];

// ── Summer ────────────────────────────────────────────────────────────────────
const SUMMER_WORDS: string[] = [
  'BEACH', 'OCEAN', 'WAVES', 'SHORE', 'SANDS',
  'TIDAL', 'CORAL', 'REEFS', 'CRABS', 'CLAMS',
  'KAYAK', 'CANOE', 'YACHT', 'SAILS', 'OZONE',
  'HUMID', 'SWEAT', 'MUGGY', 'BLAZE', 'GLARE',
  'DRIED', 'DUSTY', 'BAKED', 'PATIO', 'DECKS',
  'TONGS', 'GRILL', 'FLAME', 'SMOKE', 'COALS',
  'MELON', 'MANGO', 'PEACH', 'PLUMS', 'BERRY',
  'LEMON', 'LIMES', 'JUICY', 'TOWEL', 'VISOR',
  'SALTY', 'SANDY', 'BUOYS', 'TANKS', 'BURNT',
  'SOLAR', 'SWIMS', 'DIVES', 'FLOAT', 'FLIPS',
  'BOARD', 'STING', 'JELLY', 'SHOAL', 'ATOLL',
  'COVES', 'INLET', 'DELTA', 'FLATS', 'DUNES',
  'BLUFF', 'RIDGE', 'TREKS', 'CAMPS', 'TENTS',
  'MOTHS', 'GNATS', 'FLIES', 'BIKES', 'SKATE',
  'BRINE', 'ALGAE', 'SURGE', 'SWIRL', 'FROTH',
  'SPUME', 'SCUBA', 'FLUKE', 'BREAM', 'TROUT',
  'BASIL', 'CHIVE', 'THYME', 'CUMIN', 'ANISE',
  'ZESTY', 'TANGY', 'OASIS', 'GLINT', 'SHINY',
  'FRIZZ', 'GAUZE', 'BRINY', 'WRACK', 'REEDY',
  'BROOK', 'GUSTS', 'CRISP', 'TRAIL', 'HIKES',
];

// ── Halloween ─────────────────────────────────────────────────────────────────
const HALLOWEEN_WORDS: string[] = [
  'GHOST', 'WITCH', 'SPOOK', 'SCARY', 'MASKS',
  'CAPES', 'FANGS', 'SKULL', 'GRAVE', 'CRYPT',
  'TOMBS', 'MOANS', 'HOWLS', 'NIGHT', 'GLOOM',
  'DREAD', 'EERIE', 'CREEP', 'CRAWL', 'SCARE',
  'HAUNT', 'CURSE', 'SPELL', 'HEXED', 'BREWS',
  'FOGGY', 'MISTS', 'TROLL', 'DEMON', 'DEVIL',
  'FIEND', 'BEAST', 'DIRGE', 'KNELL', 'TOLLS',
  'ELEGY', 'COVEN', 'RUNES', 'SIGIL', 'GLYPH',
  'BANES', 'WRATH', 'SPITE', 'VENOM', 'MURKY',
  'DREGS', 'TALON', 'CLAWS', 'SNARE', 'PROWL',
  'STALK', 'LURKS', 'HIDES', 'GROWL', 'SNARL',
  'HOUND', 'RAVEN', 'CROWS', 'BLACK', 'EBONY',
  'ASHEN', 'GHOUL', 'WAILS', 'GROAN', 'DUSKY',
  'UMBRA', 'SHADE', 'MANOR', 'RUINS', 'DECAY',
  'MOLDS', 'FUNGI', 'SLIME', 'OOZES', 'MUSTY',
  'ACRID', 'FETID', 'BOGEY', 'GRIMY', 'BLEAK',
  'TAINT', 'DOOMS', 'HEXES', 'PAGAN', 'ABYSS',
  'CHASM', 'OGRES', 'DROSS', 'SABLE', 'LURID',
  'LIVID', 'GAUNT', 'WEIRD', 'STARK', 'STIFF',
  'RIGOR', 'GLOAM', 'TOILS', 'VOIDS', 'DREAR',
];

// ── Thanksgiving ──────────────────────────────────────────────────────────────
const THANKSGIVING_WORDS: string[] = [
  'FEAST', 'GRAVY', 'ROAST', 'BREAD', 'ROLLS',
  'CREAM', 'SAUCE', 'BROWN', 'CLOVE', 'MAIZE',
  'GOURD', 'WHEAT', 'LADLE', 'CARVE', 'SLICE',
  'WEDGE', 'SERVE', 'BROTH', 'STOCK', 'AMBER',
  'OCHRE', 'TAWNY', 'RUDDY', 'STOVE', 'ONION',
  'LEEKS', 'APPLE', 'NUTTY', 'SPICE', 'MAPLE',
  'ACORN', 'PECAN', 'GRAIN', 'STRAW', 'SHEAF',
  'CROPS', 'LADEN', 'UMBER', 'SEPIA', 'TAUPE',
  'CRIMP', 'CRUST', 'FLAKY', 'KNEAD', 'PROOF',
  'KNOBS', 'CHURN', 'GRIND', 'MILLS', 'PRESS',
  'PLUCK', 'DRESS', 'STUFF', 'TRUSS', 'CURED',
  'JERKY', 'BASTE', 'GLEAN', 'STORE', 'CACHE',
  'HOARD', 'SPELT', 'EMMER', 'OFFAL', 'TITHE',
  'LIVER', 'VITAL', 'ORGAN', 'TRIPE', 'BEETS',
  'KALES', 'SQUAB', 'BROIL', 'SAUTE', 'POACH',
  'CRUMB', 'GRATE', 'SIEVE', 'BLEND', 'WHISK',
  'MIXER', 'PUREE', 'SMOKY', 'SPICY', 'UMAMI',
  'YUMMY', 'TASTY', 'LUMPY', 'GORGE', 'SATED',
  'PLUMP', 'AMPLE', 'GIVEN', 'THANK', 'SHARE',
  'TRIBE', 'FOLKS', 'UNION', 'HAPPY', 'CHORE',
];

// ── Christmas & Winter ────────────────────────────────────────────────────────
const CHRISTMAS_WORDS: string[] = [
  'HOLLY', 'BELLS', 'SNOWY', 'ELVES', 'STARS',
  'PEACE', 'MERRY', 'JOLLY', 'CHEER', 'CHILL',
  'FROST', 'FLAKE', 'DRIFT', 'SLEET', 'SLEDS',
  'CAROL', 'TREES', 'PINES', 'CEDAR', 'CABIN',
  'LODGE', 'EMBER', 'GLOWS', 'GLEAM', 'COCOA',
  'CIDER', 'ICING', 'SUGAR', 'FUDGE', 'MINTS',
  'TAFFY', 'SCARF', 'MITTS', 'BOOTS', 'CLOAK',
  'SHAWL', 'WOOLY', 'PLAID', 'TWEED', 'STOLE',
  'DRAPE', 'SWAGS', 'POLAR', 'BEARS', 'BELOW',
  'NIPPY', 'FIGGY', 'HALOS', 'CROWN', 'SAINT',
  'MYRRH', 'SHINE', 'TORCH', 'TAPER', 'WICKS',
  'PUNCH', 'MULLS', 'CHIME', 'PEALS', 'PARTY',
  'REVEL', 'WRAPS', 'TWINE', 'SOCKS', 'VISIT',
  'GREET', 'NOTES', 'TOWER', 'NUMBS', 'HOARY',
  'RIMED', 'GELID', 'PARKA', 'MUFFS', 'GLOVE',
  'CACAO', 'KNOLL', 'GABLE', 'PLUMB', 'TROVE',
  'HOUSE', 'STOKE', 'ALOFT', 'ABOVE', 'BLEST',
  'MERCY', 'SHONE', 'GLITZ', 'ROUND', 'STOUT',
  'ROBES', 'LINEN', 'COMET', 'VIXEN', 'POLKA',
  'GAUZY', 'LUNAR', 'NORTH', 'JOLTS', 'TRICE',
];

const PACKS: Record<SeasonKey, string[]> = {
  easter:       EASTER_WORDS,
  valentines:   VALENTINES_WORDS,
  summer:       SUMMER_WORDS,
  halloween:    HALLOWEEN_WORDS,
  thanksgiving: THANKSGIVING_WORDS,
  christmas:    CHRISTMAS_WORDS,
};

/** Returns the target word for a given season and 1-based level. Wraps at 100. */
export function getSeasonalWord(seasonKey: SeasonKey, level: number): string {
  const pack = PACKS[seasonKey];
  if (!pack) return 'BLOOM';
  return pack[(level - 1) % pack.length];
}

/** Number of levels in the pack (always 100). */
export function seasonalPackSize(seasonKey: SeasonKey): number {
  return PACKS[seasonKey]?.length ?? 100;
}

/** Helper: capitalize first letter of season key → field suffix. e.g. 'easter' → 'Easter' */
export function capitalizeSeasonKey(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Returns the PlayerProgress field name for a given season key's level tracker. */
export function seasonalLevelField(seasonKey: SeasonKey): string {
  return `seasonal${capitalizeSeasonKey(seasonKey)}Level`;
}
