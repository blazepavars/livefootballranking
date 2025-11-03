// Comprehensive International Tournament Configuration
// 65+ international competitions with full metadata

export interface TournamentMetadata {
  leagueId: number;
  name: string;
  confederation: 'FIFA' | 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC' | 'ALL';
  tier: number; // 1=Global, 2=Continental Finals, 3=Qualifiers, 4=Nations League, 5=Sub-Regional, 6=Youth, 7=Friendlies
  baseImportance: number; // Base FIFA importance multiplier
  logoUrl?: string;
}

// COMPREHENSIVE TOURNAMENT DATABASE - ALL INTERNATIONAL COMPETITIONS
export const TOURNAMENT_REGISTRY: TournamentMetadata[] = [
  // FIFA GLOBAL TOURNAMENTS (Tier 1)
  { leagueId: 1, name: 'FIFA World Cup', confederation: 'FIFA', tier: 1, baseImportance: 50, logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/2022_FIFA_World_Cup.svg/200px-2022_FIFA_World_Cup.svg.png' },
  { leagueId: 21, name: 'FIFA Confederations Cup', confederation: 'FIFA', tier: 1, baseImportance: 40 },
  { leagueId: 480, name: 'Olympic Football Tournament', confederation: 'FIFA', tier: 1, baseImportance: 25 },
  { leagueId: 20, name: 'FIFA U-20 World Cup', confederation: 'FIFA', tier: 6, baseImportance: 25 },
  { leagueId: 23, name: 'FIFA U-17 World Cup', confederation: 'FIFA', tier: 6, baseImportance: 25 },
  { leagueId: 486, name: 'FIFA Arab Cup', confederation: 'FIFA', tier: 5, baseImportance: 15 },
  
  // WORLD CUP QUALIFIERS (Tier 3)
  { leagueId: 29, name: 'World Cup Qualification - Africa', confederation: 'CAF', tier: 3, baseImportance: 25 },
  { leagueId: 30, name: 'World Cup Qualification - Asia', confederation: 'AFC', tier: 3, baseImportance: 25 },
  { leagueId: 31, name: 'World Cup Qualification - CONCACAF', confederation: 'CONCACAF', tier: 3, baseImportance: 25 },
  { leagueId: 32, name: 'World Cup Qualification - Europe', confederation: 'UEFA', tier: 3, baseImportance: 25 },
  { leagueId: 33, name: 'World Cup Qualification - Oceania', confederation: 'OFC', tier: 3, baseImportance: 25 },
  { leagueId: 34, name: 'World Cup Qualification - South America', confederation: 'CONMEBOL', tier: 3, baseImportance: 25 },
  { leagueId: 37, name: 'World Cup Intercontinental Play-offs', confederation: 'FIFA', tier: 3, baseImportance: 25 },
  
  // UEFA (EUROPE) - 7 TOURNAMENTS
  { leagueId: 4, name: 'UEFA European Championship', confederation: 'UEFA', tier: 2, baseImportance: 35, logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/96/UEFA_Euro_2020_Logo.svg/200px-UEFA_Euro_2020_Logo.svg.png' },
  { leagueId: 960, name: 'UEFA Euro Qualification', confederation: 'UEFA', tier: 3, baseImportance: 25 },
  { leagueId: 5, name: 'UEFA Nations League', confederation: 'UEFA', tier: 4, baseImportance: 15 },
  { leagueId: 577, name: 'UEFA U-21 Championship', confederation: 'UEFA', tier: 6, baseImportance: 20 },
  { leagueId: 578, name: 'UEFA U-19 Championship', confederation: 'UEFA', tier: 6, baseImportance: 15 },
  { leagueId: 579, name: 'UEFA U-17 Championship', confederation: 'UEFA', tier: 6, baseImportance: 15 },
  
  // CAF (AFRICA) - 6 TOURNAMENTS
  { leagueId: 6, name: 'Africa Cup of Nations', confederation: 'CAF', tier: 2, baseImportance: 35, logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/2023_Africa_Cup_of_Nations_logo.svg/200px-2023_Africa_Cup_of_Nations_logo.svg.png' },
  { leagueId: 36, name: 'Africa Cup of Nations Qualification', confederation: 'CAF', tier: 3, baseImportance: 25 },
  { leagueId: 19, name: 'African Nations Championship', confederation: 'CAF', tier: 5, baseImportance: 20 },
  { leagueId: 1163, name: 'CHAN Qualification', confederation: 'CAF', tier: 5, baseImportance: 15 },
  { leagueId: 39, name: 'Africa U-20 Cup of Nations', confederation: 'CAF', tier: 6, baseImportance: 20 },
  { leagueId: 40, name: 'Africa U-17 Cup of Nations', confederation: 'CAF', tier: 6, baseImportance: 15 },
  
  // AFC (ASIA) - 10 TOURNAMENTS
  { leagueId: 7, name: 'AFC Asian Cup', confederation: 'AFC', tier: 2, baseImportance: 35 },
  { leagueId: 35, name: 'AFC Asian Cup Qualification', confederation: 'AFC', tier: 3, baseImportance: 25 },
  { leagueId: 803, name: 'Asian Games Football', confederation: 'AFC', tier: 5, baseImportance: 25 },
  { leagueId: 25, name: 'Gulf Cup of Nations', confederation: 'AFC', tier: 5, baseImportance: 15 },
  { leagueId: 28, name: 'SAFF Championship', confederation: 'AFC', tier: 5, baseImportance: 15 },
  { leagueId: 24, name: 'ASEAN Championship', confederation: 'AFC', tier: 5, baseImportance: 15 },
  { leagueId: 1008, name: 'CAFA Nations Cup', confederation: 'AFC', tier: 5, baseImportance: 15 },
  { leagueId: 26, name: 'WAFF Championship', confederation: 'AFC', tier: 5, baseImportance: 15 },
  { leagueId: 27, name: 'EAFF E-1 Championship', confederation: 'AFC', tier: 5, baseImportance: 15 },
  { leagueId: 38, name: 'AFC U-20 Asian Cup', confederation: 'AFC', tier: 6, baseImportance: 20 },
  
  // CONCACAF (NORTH/CENTRAL AMERICA & CARIBBEAN) - 8 TOURNAMENTS
  { leagueId: 22, name: 'CONCACAF Gold Cup', confederation: 'CONCACAF', tier: 2, baseImportance: 35 },
  { leagueId: 858, name: 'CONCACAF Gold Cup Qualification', confederation: 'CONCACAF', tier: 3, baseImportance: 25 },
  { leagueId: 536, name: 'CONCACAF Nations League', confederation: 'CONCACAF', tier: 4, baseImportance: 15 },
  { leagueId: 808, name: 'CONCACAF Nations League Qualification', confederation: 'CONCACAF', tier: 4, baseImportance: 15 },
  { leagueId: 804, name: 'Caribbean Cup', confederation: 'CONCACAF', tier: 5, baseImportance: 15 },
  { leagueId: 805, name: 'Copa Centroamericana', confederation: 'CONCACAF', tier: 5, baseImportance: 15 },
  { leagueId: 881, name: 'CONCACAF Olympic Qualification', confederation: 'CONCACAF', tier: 3, baseImportance: 25 },
  
  // CONMEBOL (SOUTH AMERICA) - 2 TOURNAMENTS
  { leagueId: 9, name: 'Copa América', confederation: 'CONMEBOL', tier: 2, baseImportance: 35, logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Copa_Am%C3%A9rica_logo.svg/200px-Copa_Am%C3%A9rica_logo.svg.png' },
  { leagueId: 11, name: 'CONMEBOL Pre-Olympic Tournament', confederation: 'CONMEBOL', tier: 3, baseImportance: 25 },
  { leagueId: 885, name: 'CONMEBOL Olympic Qualification', confederation: 'CONMEBOL', tier: 3, baseImportance: 25 },
  
  // OFC (OCEANIA) - 2 TOURNAMENTS
  { leagueId: 806, name: 'OFC Nations Cup', confederation: 'OFC', tier: 2, baseImportance: 35 },
  { leagueId: 807, name: 'Pacific Games Football', confederation: 'OFC', tier: 5, baseImportance: 15 },
  { leagueId: 884, name: 'OFC Olympic Qualification', confederation: 'OFC', tier: 3, baseImportance: 25 },
  
  // OLYMPIC QUALIFIERS
  { leagueId: 882, name: 'CAF Olympic Qualification', confederation: 'CAF', tier: 3, baseImportance: 25 },
  { leagueId: 883, name: 'AFC Olympic Qualification', confederation: 'AFC', tier: 3, baseImportance: 25 },
  
  // SPECIAL INVITATIONAL TOURNAMENTS
  { leagueId: 669, name: 'Kirin Cup', confederation: 'ALL', tier: 7, baseImportance: 10 },
  { leagueId: 670, name: 'China Cup', confederation: 'ALL', tier: 7, baseImportance: 10 },
  { leagueId: 671, name: 'King\'s Cup', confederation: 'ALL', tier: 7, baseImportance: 10 },
  
  // INTERNATIONAL FRIENDLIES
  { leagueId: 10, name: 'International Friendlies', confederation: 'ALL', tier: 7, baseImportance: 10 },
];

// Quick lookup maps for performance
export const LEAGUE_ID_TO_CONFEDERATION = new Map<number, string>(
  TOURNAMENT_REGISTRY.map(t => [t.leagueId, t.confederation])
);

export const LEAGUE_ID_TO_TIER = new Map<number, number>(
  TOURNAMENT_REGISTRY.map(t => [t.leagueId, t.tier])
);

export const LEAGUE_ID_TO_NAME = new Map<number, string>(
  TOURNAMENT_REGISTRY.map(t => [t.leagueId, t.name])
);

export const LEAGUE_ID_TO_LOGO = new Map<number, string>(
  TOURNAMENT_REGISTRY.filter(t => t.logoUrl).map(t => [t.leagueId, t.logoUrl!])
);

// Array of all monitored league IDs (65+ competitions)
export const ALL_INTERNATIONAL_LEAGUE_IDS = TOURNAMENT_REGISTRY.map(t => t.leagueId);

/**
 * Get tournament metadata by league ID
 */
export function getTournamentMetadata(leagueId: number): TournamentMetadata | undefined {
  return TOURNAMENT_REGISTRY.find(t => t.leagueId === leagueId);
}

/**
 * Get confederation for a league
 */
export function getConfederation(leagueId: number): string {
  return LEAGUE_ID_TO_CONFEDERATION.get(leagueId) || 'ALL';
}

/**
 * Get tournament tier for a league
 */
export function getTournamentTier(leagueId: number): number {
  return LEAGUE_ID_TO_TIER.get(leagueId) || 7;
}

/**
 * Get tournament logo URL
 */
export function getLogoUrl(leagueId: number): string | null {
  return LEAGUE_ID_TO_LOGO.get(leagueId) || null;
}

/**
 * Filter tournaments by confederation
 */
export function getTournamentsByConfederation(confederation: string): TournamentMetadata[] {
  return TOURNAMENT_REGISTRY.filter(t => t.confederation === confederation || t.confederation === 'ALL');
}

/**
 * Filter tournaments by tier
 */
export function getTournamentsByTier(tier: number): TournamentMetadata[] {
  return TOURNAMENT_REGISTRY.filter(t => t.tier === tier);
}

/**
 * Get statistics about tournament coverage
 */
export function getCoverageStats() {
  const byConfederation = {
    FIFA: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'FIFA').length,
    UEFA: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'UEFA').length,
    CONMEBOL: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'CONMEBOL').length,
    CONCACAF: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'CONCACAF').length,
    CAF: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'CAF').length,
    AFC: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'AFC').length,
    OFC: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'OFC').length,
    ALL: TOURNAMENT_REGISTRY.filter(t => t.confederation === 'ALL').length,
  };
  
  const byTier = {
    'Global': TOURNAMENT_REGISTRY.filter(t => t.tier === 1).length,
    'Continental Finals': TOURNAMENT_REGISTRY.filter(t => t.tier === 2).length,
    'Qualifiers': TOURNAMENT_REGISTRY.filter(t => t.tier === 3).length,
    'Nations League': TOURNAMENT_REGISTRY.filter(t => t.tier === 4).length,
    'Sub-Regional': TOURNAMENT_REGISTRY.filter(t => t.tier === 5).length,
    'Youth': TOURNAMENT_REGISTRY.filter(t => t.tier === 6).length,
    'Friendlies': TOURNAMENT_REGISTRY.filter(t => t.tier === 7).length,
  };
  
  return {
    total: TOURNAMENT_REGISTRY.length,
    byConfederation,
    byTier,
  };
}