<template>
  <section class="panel factor-panel" aria-labelledby="factor-title">
    <div class="section-head">
      <div>
        <p class="eyebrow">Match controls</p>
        <h2 id="factor-title">冷门变量</h2>
      </div>
      <button class="ghost-button" type="button" @click="$emit('reset')">重置</button>
    </div>

    <FactorSlider
      v-for="definition in definitions"
      :key="definition.key"
      :label="definition.label"
      :model-value="factors[definition.key]"
      :low-label="definition.lowLabel"
      :high-label="definition.highLabel"
      :hint-low="definition.hintLow"
      :hint-mid="definition.hintMid"
      :hint-high="definition.hintHigh"
      @update:model-value="$emit('update:factor', definition.key, $event)"
    />
  </section>
</template>

<script setup lang="ts">
import FactorSlider from './FactorSlider.vue'
import type { MatchFactors } from '../types/match'

defineProps<{
  factors: MatchFactors
}>()

defineEmits<{
  'update:factor': [key: keyof MatchFactors, value: number]
  reset: []
}>()

const definitions: Array<{
  key: keyof MatchFactors
  label: string
  lowLabel: string
  highLabel: string
  hintLow: string
  hintMid: string
  hintHigh: string
}> = [
  {
    key: 'tacticalRestraint',
    label: '战术克制程度',
    lowLabel: '被动',
    highLabel: '克制强',
    hintLow: '弱队很难限制强队的主要进攻区域。',
    hintMid: '弱队能阶段性压缩空间。',
    hintHigh: '弱队体系明显克制强队推进方式。',
  },
  {
    key: 'defensiveExecution',
    label: '弱队防守执行力',
    lowLabel: '松散',
    highLabel: '严密',
    hintLow: '防线容易被连续传切拉开。',
    hintMid: '防守纪律稳定，仍有局部漏洞。',
    hintHigh: '低位移动和禁区保护质量很高。',
  },
  {
    key: 'setPieceAdvantage',
    label: '定位球优势',
    lowLabel: '弱',
    highLabel: '强',
    hintLow: '角球、任意球很难形成实质威胁。',
    hintMid: '定位球是偶发机会来源。',
    hintHigh: '定位球成为弱队最稳定的破门入口。',
  },
  {
    key: 'goalkeeperPerformance',
    label: '门将超常发挥',
    lowLabel: '普通',
    highLabel: '神勇',
    hintLow: '门将只能处理常规射门。',
    hintMid: '门将能化解一两次高质量机会。',
    hintHigh: '门将表现显著压低强队进球期望。',
  },
  {
    key: 'strongTeamFitness',
    label: '强队体能压力',
    lowLabel: '充沛',
    highLabel: '疲劳',
    hintLow: '强队能保持压迫和回追强度。',
    hintMid: '强队后段强度略有波动。',
    hintHigh: '强队后段回追质量明显下降。',
  },
  {
    key: 'strongTeamComplacency',
    label: '强队轻敌程度',
    lowLabel: '专注',
    highLabel: '轻敌',
    hintLow: '强队投入度高，失误率较低。',
    hintMid: '强队可能在领先前略显急躁。',
    hintHigh: '强队开局投入不足，给弱队建立信心。',
  },
  {
    key: 'disruptionRisk',
    label: '红牌或伤病扰动',
    lowLabel: '低',
    highLabel: '高',
    hintLow: '比赛更接近常规强弱对抗。',
    hintMid: '存在影响节奏的偶发事件。',
    hintHigh: '突发事件可能显著改变进球期望。',
  },
]
</script>
