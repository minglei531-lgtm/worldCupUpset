<template>
  <label class="team-selector">
    <span class="selector-label">{{ label }}</span>
    <select :value="modelValue" @change="emitValue">
      <option v-for="team in availableTeams" :key="team.id" :value="team.id">
        {{ team.name }} · {{ team.countryCode }} · 实力 {{ team.strength }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Team } from '../types/match'

const props = defineProps<{
  label: string
  modelValue: string
  teams: Team[]
  excludeId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const availableTeams = computed(() => props.teams.filter((team) => team.id !== props.excludeId))

function emitValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
