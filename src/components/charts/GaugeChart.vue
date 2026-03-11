<template>
  <div class="w-full h-full">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'

use([
  CanvasRenderer,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
])

interface Props {
  value: number
  title?: string
  height?: string
  color?: string
  max?: number
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '250px',
  color: '#3b82f6',
  max: 100,
  unit: '%',
})

const option = computed(() => ({
  title: props.title ? {
    text: props.title,
    left: 'center',
    top: 10,
    textStyle: {
      color: '#0a192f',
      fontSize: 16,
      fontWeight: 600,
    },
  } : undefined,
  series: [
    {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: props.max,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#ef4444'],
            [0.7, '#f59e0b'],
            [1, '#10b981'],
          ],
        },
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 20,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto',
        },
      },
      axisTick: {
        length: 8,
        lineStyle: {
          color: 'auto',
          width: 1,
        },
      },
      splitLine: {
        length: 12,
        lineStyle: {
          color: 'auto',
          width: 3,
        },
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: 600,
        distance: -40,
        rotate: 'tangential',
        formatter: (value: number) => {
          if (value === props.max || value === 0) {
            return String(value)
          }
          return ''
        },
      },
      title: {
        offsetCenter: [0, '-20%'],
        fontSize: 14,
        color: '#6b7280',
      },
      detail: {
        fontSize: 32,
        fontWeight: 700,
        offsetCenter: [0, '0%'],
        valueAnimation: true,
        formatter: (value: number) => {
          return `${value.toFixed(1)}${props.unit}`
        },
        color: '#0a192f',
      },
      data: [
        {
          value: props.value,
        },
      ],
    },
  ],
}))
</script>

<style scoped>
.chart {
  height: v-bind(height);
  width: 100%;
}
</style>
