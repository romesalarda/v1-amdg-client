<template>
  <div class="w-full h-full">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

export interface PieChartData {
  name: string
  value: number
}

interface Props {
  data: PieChartData[]
  title?: string
  height?: string
  donut?: boolean
  colors?: string[]
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  donut: false,
  colors: () => ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'],
  showLegend: true,
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
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    textStyle: {
      color: '#0a192f',
    },
    formatter: (params: any) => {
      return `<div style="padding: 4px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
        <div style="color: #6b7280;">
          Count: <strong>${params.value}</strong><br/>
          Percentage: <strong>${params.percent}%</strong>
        </div>
      </div>`
    }
  },
  legend: props.showLegend ? {
    orient: 'horizontal',
    bottom: 10,
    left: 'center',
    textStyle: {
      color: '#6b7280',
      fontSize: 12,
    },
    itemWidth: 12,
    itemHeight: 12,
  } : undefined,
  color: props.colors,
  series: [
    {
      type: 'pie',
      radius: props.donut ? ['45%', '70%'] : '65%',
      center: ['50%', '50%'],
      data: props.data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.15)',
        },
      },
      label: {
        show: !props.showLegend,
        formatter: '{b}: {d}%',
        color: '#6b7280',
        fontSize: 12,
      },
      labelLine: {
        show: !props.showLegend,
      },
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
