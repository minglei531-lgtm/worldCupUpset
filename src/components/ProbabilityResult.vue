<template>
  <section class="probability-grid" aria-label="模拟概率结果">
    <article class="probability-card strong">
      <span>强队获胜</span>
      <strong>{{ formatPercent(result.strongTeamWinRate) }}</strong>
    </article>
    <article class="probability-card draw">
      <span>平局</span>
      <strong>{{ formatPercent(result.drawRate) }}</strong>
    </article>
    <article class="probability-card upset">
      <span>弱队冷门获胜</span>
      <strong>{{ formatPercent(result.upsetRate) }}</strong>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { SimulationResult } from '../types/match'
import { formatPercent } from '../utils/format'

defineProps<{
  result: SimulationResult
}>()
</script>
