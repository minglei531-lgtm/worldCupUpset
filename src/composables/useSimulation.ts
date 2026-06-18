import { computed, ref, watch } from 'vue'
import { groupFixtures } from '../data/fixtures'
import { teams } from '../data/teams'
import { defaultFactors, runSimulation } from '../engine/simulation'
import type { MatchFactors, SimulationResult } from '../types/match'
import { buildSharedSearch, parseSharedState, type SharedSimulationState } from '../utils/urlState'

export function useSimulation() {
  const validTeamIds = new Set(teams.map((team) => team.id))
  const sharedState: SharedSimulationState = typeof window === 'undefined'
    ? { factors: {}, simulated: false }
    : parseSharedState(window.location.search, validTeamIds)
  const initialStrongTeamId = sharedState.strongTeamId ?? 'spain'
  const initialWeakTeamId = sharedState.weakTeamId === initialStrongTeamId
    ? 'haiti'
    : (sharedState.weakTeamId ?? 'haiti')

  const strongTeamId = ref(initialStrongTeamId)
  const weakTeamId = ref(initialWeakTeamId)
  const factors = ref<MatchFactors>({ ...defaultFactors, ...sharedState.factors })
  const result = ref<SimulationResult | null>(null)
  const seed = ref<number | null>(null)

  const strongTeam = computed(() => teams.find((team) => team.id === strongTeamId.value) ?? teams[0])
  const weakTeam = computed(() => teams.find((team) => team.id === weakTeamId.value) ?? teams[1])
  const selectedFixtureId = computed(() => {
    const fixture = groupFixtures.find((item) => {
      const fixtureTeams = [item.homeTeamId, item.awayTeamId]
      return fixtureTeams.includes(strongTeamId.value) && fixtureTeams.includes(weakTeamId.value)
    })
    return fixture?.id ?? ''
  })

  function syncUrl() {
    if (typeof window === 'undefined') return
    const search = buildSharedSearch(strongTeamId.value, weakTeamId.value, factors.value, seed.value)
    window.history.replaceState(null, '', `${window.location.pathname}${search}${window.location.hash}`)
  }

  function setFactor(key: keyof MatchFactors, value: number) {
    factors.value = {
      ...factors.value,
      [key]: value,
    }
  }

  function run(requestedSeed?: number) {
    if (strongTeam.value.id === weakTeam.value.id) {
      const fallback = teams.find((team) => team.id !== strongTeam.value.id)
      weakTeamId.value = fallback?.id ?? teams[1].id
    }

    const simulationSeed = requestedSeed ?? createSeed()
    seed.value = simulationSeed
    result.value = runSimulation(strongTeam.value, weakTeam.value, factors.value, {
      iterations: 10_000,
      seed: simulationSeed,
    })
    syncUrl()
  }

  function resetFactors() {
    factors.value = { ...defaultFactors }
  }

  function createSeed(): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return crypto.getRandomValues(new Uint32Array(1))[0]
    }
    return Date.now() >>> 0
  }

  function applyFixture(fixtureId: string) {
    const fixture = groupFixtures.find((item) => item.id === fixtureId)
    if (!fixture) return
    const homeTeam = teams.find((team) => team.id === fixture.homeTeamId)
    const awayTeam = teams.find((team) => team.id === fixture.awayTeamId)
    if (!homeTeam || !awayTeam) return

    if (homeTeam.strength >= awayTeam.strength) {
      strongTeamId.value = homeTeam.id
      weakTeamId.value = awayTeam.id
    } else {
      strongTeamId.value = awayTeam.id
      weakTeamId.value = homeTeam.id
    }
  }

  if (sharedState.simulated && sharedState.seed !== undefined) {
    run(sharedState.seed)
  } else {
    syncUrl()
  }

  watch([strongTeamId, weakTeamId, factors], () => {
    result.value = null
    seed.value = null
    syncUrl()
  }, { deep: true })

  return {
    teams,
    groupFixtures,
    strongTeamId,
    weakTeamId,
    strongTeam,
    weakTeam,
    selectedFixtureId,
    factors,
    result,
    seed,
    setFactor,
    run,
    resetFactors,
    applyFixture,
  }
}
