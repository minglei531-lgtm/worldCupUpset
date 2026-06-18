import { describe, expect, it } from 'vitest'
import { defaultFactors } from '../engine/simulation'
import { buildSharedSearch, parseSharedState } from './urlState'

describe('shared URL state', () => {
  const validTeamIds = new Set(['spain', 'haiti'])

  it('round-trips teams, factors and simulation seed', () => {
    const search = buildSharedSearch('spain', 'haiti', defaultFactors, 20260617)
    const parsed = parseSharedState(search, validTeamIds)

    expect(parsed.strongTeamId).toBe('spain')
    expect(parsed.weakTeamId).toBe('haiti')
    expect(parsed.factors).toEqual(defaultFactors)
    expect(parsed.seed).toBe(20260617)
    expect(parsed.simulated).toBe(true)
  })

  it('ignores unknown teams and out-of-range factors', () => {
    const parsed = parseSharedState('?s=unknown&w=haiti&tac=101&def=-1&gk=60', validTeamIds)

    expect(parsed.strongTeamId).toBeUndefined()
    expect(parsed.weakTeamId).toBe('haiti')
    expect(parsed.factors).toEqual({ goalkeeperPerformance: 60 })
    expect(parsed.simulated).toBe(false)
  })
})
