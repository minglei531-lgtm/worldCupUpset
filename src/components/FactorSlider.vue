<template>
  <div class="factor-row">
    <div class="factor-copy">
      <div class="factor-title">
        <span>{{ label }}</span>
        <strong>{{ modelValue }}</strong>
      </div>
      <p>{{ currentHint }}</p>
    </div>
    <div class="slider-wrap">
      <input
        :aria-label="label"
        type="range"
        min="0"
        max="100"
        step="1"
        :value="modelValue"
        @input="onInput"
      />
      <div class="slider-scale">
        <span>{{ lowLabel }}</span>
        <span>{{ highLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  modelValue: number
  lowLabel: string
  highLabel: string
  hintLow: string
  hintMid: string
  hintHigh: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const currentHint = computed(() => {
  if (props.modelValue < 35) return props.hintLow
  if (props.modelValue > 65) return props.hintHigh
  return props.hintMid
})

function onInput(event: Event) {
  emit('update:modelValue', Number((event.target as HTMLInputElement).value))
}
</script>
