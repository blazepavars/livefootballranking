/**
 * FIFA SUM (Soccer Universal Model) Elo Rating Calculator
 * Official FIFA formula implementation with all special conditions
 * 
 * Formula: P = Pbefore + I × (W - We)
 * Where:
 *   - Pbefore = Points before the match
 *   - I = Match importance multiplier
 *   - W = Match result (1 = win, 0.5 = draw, 0 = loss, 0.75 = PSO win, 0.5 = PSO loss)
 *   - We = Expected result = 1 / (10^(-dr/600) + 1)
 *   - dr = Pbefore of Team - Pbefore of Opponent
 */

export interface MatchContext {
  leagueName: string;
  stage?: string; // 'Group', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', etc.
  isKnockout?: boolean;
  isPenaltyShootout?: boolean;
  isIMCWindow?: boolean; // International Match Calendar window
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  isPenaltyShootout?: boolean;
}

/**
 * Calculate expected result using FIFA formula
 * We = 1 / (10^(-dr/600) + 1)
 */
export function calculateExpectedResult(teamPoints: number, opponentPoints: number): number {
  const dr = teamPoints - opponentPoints;
  const expected = 1 / (Math.pow(10, -dr / 600) + 1);
  return expected;
}

/**
 * Determine match importance multiplier based on competition and stage
 * 
 * Official FIFA Values:
 * - 0.5: Friendlies outside IMC windows
 * - 10: Friendlies during IMC windows
 * - 15: Nations League group phase
 * - 25: Nations League play-offs/finals, World Cup/Confederation qualifiers
 * - 35: Confederation finals up to QF
 * - 40: Confederation finals from QF onwards, Confederations Cup
 * - 50: World Cup finals up to QF
 * - 60: World Cup finals from QF onwards
 */
export function getMatchImportance(context: MatchContext): number {
  const { leagueName, stage, isIMCWindow = true } = context;
  const lowerName = leagueName.toLowerCase();
  const lowerStage = (stage || '').toLowerCase();
  
  // World Cup Finals
  if (lowerName.includes('world cup') && !lowerName.includes('qualification')) {
    // QF onwards: Semi-finals, Final, Third Place
    if (
      lowerStage.includes('quarter') ||
      lowerStage.includes('semi') ||
      lowerStage.includes('final') ||
      lowerStage.includes('third')
    ) {
      return 60;
    }
    // Group stage and R16
    return 50;
  }
  
  // World Cup Qualifiers
  if (lowerName.includes('world cup') && lowerName.includes('qualification')) {
    return 25;
  }
  
  // UEFA Euro Championship, Copa America, African Cup, Asian Cup
  if (
    lowerName.includes('euro') ||
    lowerName.includes('copa america') ||
    lowerName.includes('african cup') ||
    lowerName.includes('asia') ||
    lowerName.includes('afcon')
  ) {
    // QF onwards
    if (
      lowerStage.includes('quarter') ||
      lowerStage.includes('semi') ||
      lowerStage.includes('final') ||
      lowerStage.includes('third')
    ) {
      return 40;
    }
    // Group stage and R16
    return 35;
  }
  
  // Confederations Cup
  if (lowerName.includes('confederations cup')) {
    return 40;
  }
  
  // UEFA Nations League
  if (lowerName.includes('nations league')) {
    // Finals, Semi-finals, Play-offs
    if (
      lowerStage.includes('final') ||
      lowerStage.includes('semi') ||
      lowerStage.includes('play-off') ||
      lowerStage.includes('playoff')
    ) {
      return 25;
    }
    // Group phase (League A, B, C, D)
    return 15;
  }
  
  // Confederation Qualifiers
  if (
    lowerName.includes('qualification') ||
    lowerName.includes('qualifier')
  ) {
    return 25;
  }
  
  // Friendlies
  if (lowerName.includes('friendly') || lowerName.includes('international')) {
    // During International Match Calendar windows
    if (isIMCWindow) {
      return 10;
    }
    // Outside IMC windows
    return 0.5;
  }
  
  // Default for unrecognized competitions (assume friendly during IMC)
  return 10;
}

/**
 * Determine actual result value (W) including special conditions
 * 
 * Standard:
 * - Win: 1.0
 * - Draw: 0.5
 * - Loss: 0.0
 * 
 * Penalty Shootout:
 * - PSO Win: 0.75
 * - PSO Loss: 0.5
 */
export function getActualResult(
  teamScore: number,
  opponentScore: number,
  isPenaltyShootout: boolean = false
): number {
  if (teamScore > opponentScore) {
    // Win
    return isPenaltyShootout ? 0.75 : 1.0;
  } else if (teamScore < opponentScore) {
    // Loss
    return isPenaltyShootout ? 0.5 : 0.0;
  } else {
    // Draw (including PSO for losing team after draw)
    return 0.5;
  }
}

/**
 * Calculate Elo points change for a team
 * 
 * Special Conditions:
 * - Knock-out rounds: Teams don't lose points if (W - We) < 0
 */
export function calculateEloChange(
  teamPoints: number,
  opponentPoints: number,
  actualResult: number,
  importance: number,
  isKnockout: boolean = false
): number {
  const expected = calculateExpectedResult(teamPoints, opponentPoints);
  const rawChange = importance * (actualResult - expected);
  
  // Knock-out round protection: Don't lose points when expected to lose
  if (isKnockout && rawChange < 0) {
    return 0;
  }
  
  // Round to 1 decimal place
  return Math.round(rawChange * 10) / 10;
}

/**
 * Calculate initial seeding points for new teams
 * Pseeding = 1600 - (Rank - 1) × 4
 * 
 * Results in:
 * - Rank 1: 1600 points
 * - Rank 100: 1204 points
 * - Rank 200: 804 points
 */
export function calculateSeedingPoints(initialRank: number): number {
  return 1600 - (initialRank - 1) * 4;
}

/**
 * Determine if match is in a knock-out stage based on stage name
 */
export function isKnockoutStage(stage?: string): boolean {
  if (!stage) return false;
  
  const lowerStage = stage.toLowerCase();
  return (
    lowerStage.includes('round of') ||
    lowerStage.includes('quarter') ||
    lowerStage.includes('semi') ||
    lowerStage.includes('final') ||
    lowerStage.includes('play-off') ||
    lowerStage.includes('playoff')
  );
}

/**
 * Determine if current date is within an International Match Calendar window
 * 
 * FIFA International Match Calendar windows (approximate):
 * - March (late March)
 * - June (early June)
 * - September (early September)
 * - October (mid October)
 * - November (mid November)
 */
export function isInIMCWindow(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  
  // March: days 20-31
  if (month === 2 && day >= 20) return true;
  
  // June: days 1-15
  if (month === 5 && day <= 15) return true;
  
  // September: days 1-15
  if (month === 8 && day <= 15) return true;
  
  // October: days 10-20
  if (month === 9 && day >= 10 && day <= 20) return true;
  
  // November: days 10-25
  if (month === 10 && day >= 10 && day <= 25) return true;
  
  return false;
}

/**
 * Complete Elo calculation with all FIFA SUM rules applied
 */
export interface EloCalculationInput {
  teamPoints: number;
  opponentPoints: number;
  teamScore: number;
  opponentScore: number;
  context: MatchContext;
}

export interface EloCalculationResult {
  pointsChange: number;
  pointsAfter: number;
  expectedResult: number;
  actualResult: number;
  importance: number;
  appliedKnockoutProtection: boolean;
}

export function calculateCompleteElo(input: EloCalculationInput): EloCalculationResult {
  const { teamPoints, opponentPoints, teamScore, opponentScore, context } = input;
  
  // Determine importance
  const importance = getMatchImportance(context);
  
  // Determine actual result
  const actualResult = getActualResult(teamScore, opponentScore, context.isPenaltyShootout);
  
  // Calculate expected result
  const expectedResult = calculateExpectedResult(teamPoints, opponentPoints);
  
  // Determine if knockout
  const isKnockout = context.isKnockout || isKnockoutStage(context.stage);
  
  // Calculate points change
  const rawChange = importance * (actualResult - expectedResult);
  let pointsChange = rawChange;
  let appliedKnockoutProtection = false;
  
  // Apply knockout protection
  if (isKnockout && rawChange < 0) {
    pointsChange = 0;
    appliedKnockoutProtection = true;
  }
  
  // Round to 1 decimal place
  pointsChange = Math.round(pointsChange * 10) / 10;
  
  return {
    pointsChange,
    pointsAfter: teamPoints + pointsChange,
    expectedResult,
    actualResult,
    importance,
    appliedKnockoutProtection
  };
}