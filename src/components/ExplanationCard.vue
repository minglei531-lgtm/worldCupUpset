<template>
  <section class="explanation-card" aria-labelledby="explanation-title">
    <div>
      <p class="eyebrow">Match story</p>
      <h2 id="explanation-title">冷门路径解释</h2>
    </div>
    <p>{{ result.explanation }}</p>
    <dl>
      <div>
        <dt>强队 xG</dt>
        <dd>{{ result.expectedGoals.strong.toFixed(2) }}</dd>
      </div>
      <div>
        <dt>弱队 xG</dt>
        <dd>{{ result.expectedGoals.weak.toFixed(2) }}</dd>
      </div>
      <div>
        <dt>扰动概率</dt>
        <dd>{{ (result.expectedGoals.disruptionChance * 100).toFixed(1) }}%</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { SimulationResult } from '../types/match'

defineProps<{
  result: SimulationResult
}>()
</script>
