export interface Team {
  id: string
  name: string
  countryCode: string
  strength: number
  attack: number
  defense: number
  stability: number
  styleTags: string[]
}

export interface MatchFactors {
  tacticalRestraint: number
  defensiveExecution: number
  setPieceAdvantage: number
  goalkeeperPerformance: number
  strongTeamFitness: number
  strongTeamComplacency: number
  disruptionRisk: number
}

export interface ScoreProbability {
  score: string
  probability: number
}

export interface FactorContribution {
  factor: string
  contribution: number
}

export interface ExpectedGoalsBreakdown {
  strong: number
  weak: number
  disruptionChance: number
}

export interface SimulationResult {
  strongTeamWinRate: number
  drawRate: number
  upsetRate: number
  topScores: ScoreProbability[]
  factorContributions: FactorContribution[]
  explanation: string
  expectedGoals: ExpectedGoalsBreakdown
  simulations: number
}

export interface SimulationOptions {
  iterations?: number
  seed?: number
}
