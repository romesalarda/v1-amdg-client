<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFlowingGradient } from '~/composables/shading/useFlowingGradient'

const props = withDefaults(defineProps<{
  speed?:   number  // 1–10
  soft?:    number  // 1–10
  palette?: number  // 0–4
  position?: 'fixed' | 'absolute'
}>(), {
  speed:   3,
  soft:    7,
  palette: 0,
  position: 'fixed',
})

const speed   = ref(props.speed)
const soft    = ref(props.soft)
const palette = ref(props.palette)

const { canvas } = useFlowingGradient({ speed, soft, palette })
const positionClass = computed(() =>
  props.position === 'absolute' ? 'flowing-bg--absolute' : 'flowing-bg--fixed',
)
</script>

<template>
  <canvas ref="canvas" :class="['flowing-bg', positionClass]" />
</template>

<style scoped>
.flowing-bg {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.flowing-bg--fixed {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.flowing-bg--absolute {
  position: absolute;
  inset: 0;
  z-index: 0;
}
</style>