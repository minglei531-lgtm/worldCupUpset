<template>
  <section class="panel" aria-labelledby="score-title">
    <div class="section-head">
      <div>
        <p class="eyebrow">Score map</p>
        <h2 id="score-title">最常见比分</h2>
      </div>
      <span class="meta">{{ result.simulations.toLocaleString('zh-CN') }} 场</span>
    </div>
    <div class="score-list">
      <div v-for="score in result.topScores" :key="score.score" class="score-row">
        <strong>{{ score.score }}</strong>
        <div class="bar-track">
          <span class="bar-fill" :style="{ width: `${score.probability * 100 * 4}%` }"></span>
        </div>
        <span>{{ formatPercent(score.probability) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SimulationResult } from '../types/match'
import { formatPercent } from '../utils/format'

defineProps<{
  result: SimulationResult
}>()
</script>
