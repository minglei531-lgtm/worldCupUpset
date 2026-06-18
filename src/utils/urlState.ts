import type { MatchFactors } from '../types/match'

const factorQueryKeys: Record<keyof MatchFactors, string> = {
  tacticalRestraint: 'tac',
  defensiveExecution: 'def',
  setPieceAdvantage: 'set',
  goalkeeperPerformance: 'gk',
  strongTeamFitness: 'fit',
  strongTeamComplacency: 'cmp',
  disruptionRisk: 'dis',
}

export interface SharedSimulationState {
  strongTeamId?: string
  weakTeamId?: string
  factors: Partial<MatchFactors>
  seed?: number
  simulated: boolean
}

function parseBoundedInteger(value: string | null, min: number, max: number): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return undefined
  return parsed
}

export function parseSharedState(search: string, validTeamIds: Set<string>): SharedSimulationState {
  const params = new URLSearchParams(search)
  const strongCandidate = params.get('s')
  const weakCandidate = params.get('w')
  const factors: Partial<MatchFactors> = {}

  for (const [factor, queryKey] of Object.entries(factorQueryKeys) as Array<[keyof MatchFactors, string]>) {
    const parsed = parseBoundedInteger(params.get(queryKey), 0, 100)
    if (parsed !== undefined) factors[factor] = parsed
  }

  const seed = parseBoundedInteger(params.get('seed'), 0, 0xffffffff)

  return {
    strongTeamId: strongCandidate && validTeamIds.has(strongCandidate) ? strongCandidate : undefined,
    weakTeamId: weakCandidate && validTeamIds.has(weakCandidate) ? weakCandidate : undefined,
    factors,
    seed,
    simulated: params.get('sim') === '1' && seed !== undefined,
  }
}

export function buildSharedSearch(
  strongTeamId: string,
  weakTeamId: string,
  factors: MatchFactors,
  seed: number | null,
): string {
  const params = new URLSearchParams()
  params.set('s', strongTeamId)
  params.set('w', weakTeamId)

  for (const [factor, queryKey] of Object.entries(factorQueryKeys) as Array<[keyof MatchFactors, string]>) {
    params.set(queryKey, String(Math.round(factors[factor])))
  }

  if (seed !== null) {
    params.set('sim', '1')
    params.set('seed', String(seed >>> 0))
  }

  return `?${params.toString()}`
}
