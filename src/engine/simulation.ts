import type {
  ExpectedGoalsBreakdown,
  FactorContribution,
  MatchFactors,
  SimulationOptions,
  SimulationResult,
  Team,
} from '../types/match'
import { createSeededRandom, samplePoisson, type RandomSource } from './random'

const DEFAULT_ITERATIONS = 10_000

export const defaultFactors: MatchFactors = {
  tacticalRestraint: 58,
  defensiveExecution: 62,
  setPieceAdvantage: 56,
  goalkeeperPerformance: 54,
  strongTeamFitness: 42,
  strongTeamComplacency: 38,
  disruptionRisk: 28,
}

const factorLabels: Record<keyof MatchFactors, string> = {
  tacticalRestraint: '战术克制程度',
  defensiveExecution: '弱队防守执行力',
  setPieceAdvantage: '定位球优势',
  goalkeeperPerformance: '门将超常发挥',
  strongTeamFitness: '强队体能压力',
  strongTeamComplacency: '强队轻敌程度',
  disruptionRisk: '红牌或伤病扰动',
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalized(value: number): number {
  return clamp(value, 0, 100) / 100
}

function centered(value: number): number {
  return normalized(value) - 0.5
}

function tagBonus(team: Team, tags: string[]): number {
  return tags.some((tag) => team.styleTags.includes(tag)) ? 1 : 0
}

export function calculateExpectedGoals(
  strongTeam: Team,
  weakTeam: Team,
  factors: MatchFactors,
): ExpectedGoalsBreakdown {
  const strengthGap = clamp(strongTeam.strength - weakTeam.strength, -15, 45)
  const strongAttackEdge = (strongTeam.attack - weakTeam.defense) / 100
  const weakAttackPenalty = (strongTeam.defense - weakTeam.attack) / 100
  const stabilityGap = (strongTeam.stability - weakTeam.stability) / 100

  const lowBlockBonus = tagBonus(weakTeam, ['low-block', 'deep-defense', 'compact'])
  const counterBonus = tagBonus(weakTeam, ['counter', 'transition', 'pace'])
  const setPieceStyleBonus = tagBonus(weakTeam, ['set-piece', 'aerial'])

  let strongXg = 1.35 + strengthGap * 0.024 + strongAttackEdge * 1.15 + stabilityGap * 0.24
  let weakXg = 0.62 - strengthGap * 0.008 - weakAttackPenalty * 0.55

  const tactical = normalized(factors.tacticalRestraint)
  const defense = normalized(factors.defensiveExecution)
  const setPiece = normalized(factors.setPieceAdvantage)
  const goalkeeper = normalized(factors.goalkeeperPerformance)
  const fitnessPressure = normalized(factors.strongTeamFitness)
  const complacency = normalized(factors.strongTeamComplacency)
  const disruption = normalized(factors.disruptionRisk)

  const strongSuppression =
    tactical * (0.19 + lowBlockBonus * 0.04) +
    defense * 0.24 +
    goalkeeper * 0.18 +
    fitnessPressure * 0.16 +
    complacency * 0.11 +
    disruption * 0.08

  const weakBoost =
    tactical * (0.08 + counterBonus * 0.03) +
    setPiece * (0.27 + setPieceStyleBonus * 0.06) +
    fitnessPressure * 0.13 +
    complacency * 0.17 +
    disruption * 0.12

  strongXg *= 1 - clamp(strongSuppression, 0.1, 0.68)
  weakXg *= 1 + clamp(weakBoost, 0.05, 0.72)

  strongXg += (0.5 - complacency) * 0.12
  weakXg += setPiece * 0.12 + counterBonus * tactical * 0.07

  return {
    strong: clamp(strongXg, 0.35, 3.25),
    weak: clamp(weakXg, 0.25, 2.35),
    disruptionChance: clamp(0.03 + disruption * 0.24, 0.03, 0.28),
  }
}

export function getFactorContributions(strongTeam: Team, weakTeam: Team, factors: MatchFactors): FactorContribution[] {
  const strengthGap = strongTeam.strength - weakTeam.strength
  const lowBlockBonus = tagBonus(weakTeam, ['low-block', 'deep-defense', 'compact'])
  const counterBonus = tagBonus(weakTeam, ['counter', 'transition', 'pace'])
  const setPieceStyleBonus = tagBonus(weakTeam, ['set-piece', 'aerial'])

  const contributions: FactorContribution[] = [
    {
      factor: '双方基础实力差',
      contribution: clamp(-strengthGap * 0.85, -42, 12),
    },
    {
      factor: factorLabels.tacticalRestraint,
      contribution: centered(factors.tacticalRestraint) * (33 + lowBlockBonus * 7 + counterBonus * 4),
    },
    {
      factor: factorLabels.defensiveExecution,
      contribution: centered(factors.defensiveExecution) * 38,
    },
    {
      factor: factorLabels.setPieceAdvantage,
      contribution: centered(factors.setPieceAdvantage) * (34 + setPieceStyleBonus * 8),
    },
    {
      factor: factorLabels.goalkeeperPerformance,
      contribution: centered(factors.goalkeeperPerformance) * 29,
    },
    {
      factor: factorLabels.strongTeamFitness,
      contribution: centered(factors.strongTeamFitness) * 27,
    },
    {
      factor: factorLabels.strongTeamComplacency,
      contribution: centered(factors.strongTeamComplacency) * 30,
    },
    {
      factor: factorLabels.disruptionRisk,
      contribution: centered(factors.disruptionRisk) * 31,
    },
  ]

  return contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
}

function buildExplanation(
  strongTeam: Team,
  weakTeam: Team,
  factors: MatchFactors,
  contributions: FactorContribution[],
  resultRates: Pick<SimulationResult, 'upsetRate' | 'drawRate' | 'strongTeamWinRate'>,
): string {
  const positiveDrivers = contributions.filter((item) => item.contribution > 2).slice(0, 3)
  const mainDrivers = positiveDrivers.length > 0 ? positiveDrivers.map((item) => item.factor).join('、') : '定位球和防守纪律'
  const riskLevel =
    resultRates.upsetRate > 0.28 ? '已经具备较高冷门窗口' : resultRates.upsetRate > 0.15 ? '存在清晰冷门窗口' : '仍然需要多个事件同时发生'

  const tacticText =
    factors.tacticalRestraint >= 60 || weakTeam.styleTags.includes('low-block') || weakTeam.styleTags.includes('compact')
      ? '通过低位防守压缩中路空间'
      : '用更直接的攻防转换减少阵地战消耗'
  const scoringText =
    factors.setPieceAdvantage >= 58 || weakTeam.styleTags.includes('set-piece')
      ? '依靠定位球或二点球制造第一波得分机会'
      : '等待强队压上后的反击空当'
  const strongWeaknessText =
    factors.strongTeamFitness >= 58
      ? `${strongTeam.name}体能压力上升后回追质量下降`
      : factors.strongTeamComplacency >= 58
        ? `${strongTeam.name}开局投入不足，给了弱队进入比赛节奏的时间`
        : '比赛需要保持低比分，尽量把悬念拖到最后阶段'

  return `这场比赛的冷门概率为 ${(resultRates.upsetRate * 100).toFixed(1)}%，${riskLevel}。最主要的路径是：${weakTeam.name}${tacticText}，再${scoringText}。关键推动因素来自${mainDrivers}；如果${strongWeaknessText}，弱队在领先或平局状态下的容错率会明显提高。`
}

function simulateOneMatch(expected: ExpectedGoalsBreakdown, random: RandomSource): [number, number] {
  let strongXg = expected.strong
  let weakXg = expected.weak

  if (random() < expected.disruptionChance) {
    strongXg *= 0.76
    weakXg += 0.24
  }

  return [samplePoisson(strongXg, random), samplePoisson(weakXg, random)]
}

export function runSimulation(
  strongTeam: Team,
  weakTeam: Team,
  factors: MatchFactors,
  options: SimulationOptions = {},
): SimulationResult {
  const iterations = options.iterations ?? DEFAULT_ITERATIONS
  const random = options.seed === undefined ? Math.random : createSeededRandom(options.seed)
  const expectedGoals = calculateExpectedGoals(strongTeam, weakTeam, factors)
  const scoreCounts = new Map<string, number>()

  let strongWins = 0
  let draws = 0
  let upsets = 0

  for (let index = 0; index < iterations; index += 1) {
    const [strongGoals, weakGoals] = simulateOneMatch(expectedGoals, random)
    const score = `${strongGoals}-${weakGoals}`
    scoreCounts.set(score, (scoreCounts.get(score) ?? 0) + 1)

    if (strongGoals > weakGoals) {
      strongWins += 1
    } else if (strongGoals === weakGoals) {
      draws += 1
    } else {
      upsets += 1
    }
  }

  const factorContributions = getFactorContributions(strongTeam, weakTeam, factors)
  const rates = {
    strongTeamWinRate: strongWins / iterations,
    drawRate: draws / iterations,
    upsetRate: upsets / iterations,
  }

  return {
    ...rates,
    topScores: [...scoreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([score, count]) => ({
        score,
        probability: count / iterations,
      })),
    factorContributions,
    explanation: buildExplanation(strongTeam, weakTeam, factors, factorContributions, rates),
    expectedGoals,
    simulations: iterations,
  }
}
