import { describe, expect, it } from 'vitest'
import { groupFixtures } from '../data/fixtures'
import { teams } from '../data/teams'
import { defaultFactors, runSimulation } from './simulation'

const strongTeam = teams.find((team) => team.id === 'spain')!
const weakTeam = teams.find((team) => team.id === 'haiti')!

describe('runSimulation', () => {
  it('contains the 48 unique 2026 World Cup teams', () => {
    expect(teams).toHaveLength(48)
    expect(new Set(teams.map((team) => team.id)).size).toBe(48)
    expect(new Set(teams.map((team) => team.countryCode)).size).toBe(48)
  })

  it('maps all 72 group fixtures to known teams', () => {
    const teamIds = new Set(teams.map((team) => team.id))
    expect(groupFixtures).toHaveLength(72)
    expect(groupFixtures.every((fixture) => teamIds.has(fixture.homeTeamId) && teamIds.has(fixture.awayTeamId))).toBe(true)
  })

  it('returns probabilities that add up to one', () => {
    const result = runSimulation(strongTeam, weakTeam, defaultFactors, {
      iterations: 10_000,
      seed: 17,
    })
    const total = result.strongTeamWinRate + result.drawRate + result.upsetRate

    expect(total).toBeCloseTo(1, 6)
    expect(result.topScores.length).toBeGreaterThanOrEqual(5)
  })

  it('responds to stronger upset conditions', () => {
    const conservative = runSimulation(
      strongTeam,
      weakTeam,
      {
        tacticalRestraint: 20,
        defensiveExecution: 20,
        setPieceAdvantage: 20,
        goalkeeperPerformance: 20,
        strongTeamFitness: 10,
        strongTeamComplacency: 10,
        disruptionRisk: 10,
      },
      { iterations: 10_000, seed: 23 },
    )
    const volatile = runSimulation(
      strongTeam,
      weakTeam,
      {
        tacticalRestraint: 88,
        defensiveExecution: 90,
        setPieceAdvantage: 86,
        goalkeeperPerformance: 82,
        strongTeamFitness: 86,
        strongTeamComplacency: 84,
        disruptionRisk: 82,
      },
      { iterations: 10_000, seed: 23 },
    )

    expect(volatile.upsetRate).toBeGreaterThan(conservative.upsetRate)
  })
})
