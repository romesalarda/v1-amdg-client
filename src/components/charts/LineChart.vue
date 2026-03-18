<template>
  <div class="w-full h-full">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
])

interface Props {
  data: number[]
  labels: string[]
  color?: string
  smooth?: boolean
  showGrid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: '#0a192f', // deep-navy
  smooth: true,
  showGrid: true,
})

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    textStyle: {
      color: '#0a192f',
    },
    formatter: (params: any) => {
      const point = params[0]
      return `<div style="padding: 4px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
        <div style="color: #6b7280;">${point.name || 'Value'}: <strong>${point.value}</strong></div>
      </div>`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '10%',
    containLabel: true,
    show: props.showGrid,
    borderColor: 'rgba(10, 25, 47, 0.05)',
  },
  xAxis: {
    type: 'category',
    data: props.labels,
    boundaryGap: false,
    axisLine: {
      lineStyle: {
        color: 'rgba(10, 25, 47, 0.1)',
      },
    },
    axisLabel: {
      color: '#9ca3af',
      fontSize: 11,
      fontWeight: 600,
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false,
    },
    axisLabel: {
      color: '#9ca3af',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(10, 25, 47, 0.05)',
      },
    },
  },
  series: [
    {
      data: props.data,
      type: 'line',
      smooth: props.smooth,
      lineStyle: {
        color: props.color,
        width: 3,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: `${props.color}15`, // 15% opacity
            },
            {
              offset: 1,
              color: `${props.color}00`, // 0% opacity
            },
          ],
        },
      },
      itemStyle: {
        color: props.color,
        borderWidth: 2,
        borderColor: '#fff',
      },
      emphasis: {
        itemStyle: {
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: props.color,
        },
      },
    },
  ],
}))
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
