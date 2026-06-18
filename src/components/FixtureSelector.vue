<template>
  <label class="fixture-selector">
    <span class="selector-label">按真实小组赛快速选择</span>
    <select :value="modelValue" @change="emitSelection">
      <option value="">自定义对阵</option>
      <optgroup v-for="group in groupedFixtures" :key="group.name" :label="`${group.name}组`">
        <option v-for="fixture in group.fixtures" :key="fixture.id" :value="fixture.id">
          {{ formatKickoff(fixture.kickoff) }} · {{ teamName(fixture.homeTeamId) }} vs {{ teamName(fixture.awayTeamId) }}
        </option>
      </optgroup>
    </select>
    <small>赛程时间按北京时间显示，选择后自动识别强弱方。</small>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GroupFixture } from '../data/fixtures'
import type { Team } from '../types/match'

const props = defineProps<{
  modelValue: string
  fixtures: GroupFixture[]
  teams: Team[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const groupedFixtures = computed(() =>
  'ABCDEFGHIJKL'.split('').map((name) => ({
    name,
    fixtures: props.fixtures.filter((fixture) => fixture.group === name),
  })),
)

function teamName(teamId: string): string {
  return props.teams.find((team) => team.id === teamId)?.name ?? teamId
}

function formatKickoff(kickoff: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(kickoff))
}

function emitSelection(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
