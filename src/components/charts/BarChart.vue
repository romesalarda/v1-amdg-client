<template>
  <div class="w-full h-full">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

export interface BarChartData {
  label: string
  value: number
}

interface Props {
  data: BarChartData[]
  title?: string
  height?: string
  color?: string
  horizontal?: boolean
  showGrid?: boolean
  showValues?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  color: '#3b82f6',
  horizontal: false,
  showGrid: true,
  showValues: false,
})

const option = computed(() => {
  const isHorizontal = props.horizontal
  
  return {
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
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#0a192f',
      },
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      formatter: (params: any) => {
        const point = params[0]
        return `<div style="padding: 4px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
          <div style="color: #6b7280;">Count: <strong>${point.value}</strong></div>
        </div>`
      }
    },
    grid: {
      left: isHorizontal ? '15%' : '3%',
      right: '4%',
      bottom: isHorizontal ? '3%' : '10%',
      top: props.title ? '60px' : '20px',
      containLabel: true,
      show: props.showGrid,
      borderColor: 'rgba(10, 25, 47, 0.05)',
    },
    xAxis: {
      type: isHorizontal ? 'value' : 'category',
      data: isHorizontal ? undefined : props.data.map(d => d.label),
      axisLine: {
        lineStyle: {
          color: 'rgba(10, 25, 47, 0.1)',
        },
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: 600,
        rotate: isHorizontal ? 0 : 45,
      },
      splitLine: {
        show: isHorizontal && props.showGrid,
        lineStyle: {
          color: 'rgba(10, 25, 47, 0.05)',
        },
      },
    },
    yAxis: {
      type: isHorizontal ? 'category' : 'value',
      data: isHorizontal ? props.data.map(d => d.label) : undefined,
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
        show: !isHorizontal && props.showGrid,
        lineStyle: {
          color: 'rgba(10, 25, 47, 0.05)',
        },
      },
    },
    series: [
      {
        type: 'bar',
        data: props.data.map(d => d.value),
        itemStyle: {
          color: props.color,
          borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        },
        label: props.showValues ? {
          show: true,
          position: isHorizontal ? 'right' : 'top',
          color: '#6b7280',
          fontSize: 11,
          fontWeight: 600,
        } : undefined,
        emphasis: {
          itemStyle: {
            color: props.color,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
          },
        },
      },
    ],
  }
})
</script>

<style scoped>
.chart {
  height: v-bind(height);
  width: 100%;
}
</style>
