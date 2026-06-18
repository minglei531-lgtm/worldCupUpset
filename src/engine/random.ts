export type RandomSource = () => number

export function createSeededRandom(seed = 2026): RandomSource {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function samplePoisson(lambda: number, random: RandomSource): number {
  const cappedLambda = Math.max(0.05, Math.min(5.5, lambda))
  const limit = Math.exp(-cappedLambda)
  let product = 1
  let count = 0

  do {
    count += 1
    product *= random()
  } while (product > limit)

  return Math.min(8, count - 1)
}
