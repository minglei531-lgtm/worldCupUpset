<template>
  <section class="share-toolbar" aria-label="分享模拟结果">
    <div>
      <strong>保存这次模拟</strong>
      <span>当前球队、参数和随机种子已写入 URL。</span>
    </div>
    <div class="share-buttons">
      <button class="secondary-button" type="button" @click="copyLink">
        {{ linkLabel }}
      </button>
      <button class="secondary-button accent" type="button" :disabled="isGenerating" @click="shareCard">
        {{ cardLabel }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MatchFactors, SimulationResult, Team } from '../types/match'
import { createShareCard } from '../utils/shareCard'

const props = defineProps<{
  strongTeam: Team
  weakTeam: Team
  factors: MatchFactors
  result: SimulationResult
}>()

const linkStatus = ref<'idle' | 'copied' | 'failed'>('idle')
const cardStatus = ref<'idle' | 'working' | 'saved' | 'failed'>('idle')
const isGenerating = computed(() => cardStatus.value === 'working')
const linkLabel = computed(() => linkStatus.value === 'copied' ? '链接已复制' : linkStatus.value === 'failed' ? '复制失败' : '复制参数链接')
const cardLabel = computed(() => {
  if (cardStatus.value === 'working') return '正在生成…'
  if (cardStatus.value === 'saved') return '分享卡已下载'
  if (cardStatus.value === 'failed') return '生成失败'
  return '下载分享卡片'
})

function resetStatus(target: 'link' | 'card') {
  window.setTimeout(() => {
    if (target === 'link') linkStatus.value = 'idle'
    else cardStatus.value = 'idle'
  }, 2200)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    linkStatus.value = 'copied'
  } catch {
    linkStatus.value = 'failed'
  }
  resetStatus('link')
}

async function shareCard() {
  cardStatus.value = 'working'
  try {
    const blob = await createShareCard(props)
    const filename = `${props.strongTeam.name}-vs-${props.weakTeam.name}-冷门模拟.png`
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    cardStatus.value = 'saved'
  } catch (error) {
    cardStatus.value = 'failed'
  }
  resetStatus('card')
}
</script>
