// Tournament and Confederation Utility Functions

export interface ConfederationInfo {
  name: string
  shortName: string
  color: string
  bgColor: string
}

export const CONFEDERATIONS: { [key: string]: ConfederationInfo } = {
  FIFA: {
    name: 'FIFA Global',
    shortName: 'FIFA',
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue bg-opacity-20'
  },
  UEFA: {
    name: 'UEFA (Europe)',
    shortName: 'UEFA',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400 bg-opacity-20'
  },
  CONMEBOL: {
    name: 'CONMEBOL (South America)',
    shortName: 'CONMEBOL',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400 bg-opacity-20'
  },
  CONCACAF: {
    name: 'CONCACAF (North/Central America)',
    shortName: 'CONCACAF',
    color: 'text-green-400',
    bgColor: 'bg-green-400 bg-opacity-20'
  },
  CAF: {
    name: 'CAF (Africa)',
    shortName: 'CAF',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400 bg-opacity-20'
  },
  AFC: {
    name: 'AFC (Asia)',
    shortName: 'AFC',
    color: 'text-red-400',
    bgColor: 'bg-red-400 bg-opacity-20'
  },
  OFC: {
    name: 'OFC (Oceania)',
    shortName: 'OFC',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400 bg-opacity-20'
  },
  ALL: {
    name: 'International',
    shortName: 'INT',
    color: 'text-text-secondary',
    bgColor: 'bg-text-tertiary bg-opacity-20'
  }
}

export function getConfederationInfo(confederation?: string): ConfederationInfo {
  return CONFEDERATIONS[confederation || 'ALL'] || CONFEDERATIONS.ALL
}

export function getTournamentTierLabel(tier?: number): string {
  switch (tier) {
    case 1:
      return 'Global'
    case 2:
      return 'Continental Finals'
    case 3:
      return 'Qualifiers'
    case 4:
      return 'Nations League'
    case 5:
      return 'Sub-Regional'
    case 6:
      return 'Youth'
    case 7:
      return 'Friendlies'
    default:
      return 'Other'
  }
}

export function getTournamentTierBadgeClass(tier?: number): string {
  switch (tier) {
    case 1:
      return 'bg-purple-500 bg-opacity-20 text-purple-400'
    case 2:
      return 'bg-accent-blue bg-opacity-20 text-accent-blue'
    case 3:
      return 'bg-accent-orange bg-opacity-20 text-accent-orange'
    case 4:
      return 'bg-accent-green bg-opacity-20 text-accent-green'
    case 5:
      return 'bg-yellow-500 bg-opacity-20 text-yellow-400'
    case 6:
      return 'bg-cyan-500 bg-opacity-20 text-cyan-400'
    case 7:
      return 'bg-text-tertiary bg-opacity-20 text-text-tertiary'
    default:
      return 'bg-text-tertiary bg-opacity-20 text-text-tertiary'
  }
}