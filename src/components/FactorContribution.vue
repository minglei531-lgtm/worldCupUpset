<template>
  <section class="panel" aria-labelledby="contribution-title">
    <div class="section-head">
      <div>
        <p class="eyebrow">Why it happens</p>
        <h2 id="contribution-title">冷门因素贡献</h2>
      </div>
      <span class="meta">正值利于冷门</span>
    </div>
    <div class="contribution-list">
      <div v-for="item in result.factorContributions" :key="item.factor" class="contribution-row">
        <div class="contribution-label">
          <span>{{ item.factor }}</span>
          <strong :class="{ negative: item.contribution < 0 }">{{ formatSigned(item.contribution) }}</strong>
        </div>
        <div class="contribution-track">
          <span
            class="contribution-fill"
            :class="{ negative: item.contribution < 0 }"
            :style="{ width: `${Math.min(Math.abs(item.contribution), 42) / 42 * 100}%` }"
          ></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SimulationResult } from '../types/match'
import { formatSigned } from '../utils/format'

defineProps<{
  result: SimulationResult
}>()
</script>
