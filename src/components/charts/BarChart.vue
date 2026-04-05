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
  label?: string
  valueUnit?: string
  valueFormatter?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  color: '#3b82f6',
  horizontal: false,
  showGrid: true,
  showValues: false,
})

const formatChartValue = (value: number) => {
  if (props.valueFormatter) return props.valueFormatter(value)
  return props.valueUnit ? `${value.toLocaleString('en-GB')} ${props.valueUnit}` : value.toLocaleString('en-GB')
}

const categoryLabelRotation = computed(() => {
  if (props.horizontal || props.data.length === 0) return 0

  const labelLengths = props.data.map((item) => item.label.trim().length)
  const longestLabel = Math.max(...labelLengths, 0)
  const labelCount = props.data.length
  const densityScore = labelCount * Math.max(longestLabel, 6)

  if (densityScore > 140 || longestLabel > 18) return 45
  if (densityScore > 90 || longestLabel > 12) return 30
  if (densityScore > 50 || labelCount > 8) return 20
  return 0
})

const option = computed(() => {
  const isHorizontal = props.horizontal
  const axisValueFormatter = (value: number) => formatChartValue(value)
  
  return {
    title: props.title ? {
      text: props.title,
      left: 'center',
      top: 10,
      textStyle: {
        color: '#0f172a',
        fontSize: 15,
        fontWeight: 600,
      },
    } : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 14,
      padding: [10, 12],
      textStyle: {
        color: '#0f172a',
      },
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(15, 23, 42, 0.05)',
        },
      },
      formatter: (params: any) => {
        const point = params[0]
        return `<div style="padding: 4px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
          <div style="color: #64748b;">${props.label || 'Value'}: <strong>${formatChartValue(Number(point.value ?? point.data ?? 0))}</strong></div>
        </div>`
      }
    },
    grid: {
      left: isHorizontal ? '15%' : '3%',
      right: '4%',
      bottom: isHorizontal ? '3%' : '10%',
      top: props.title ? '56px' : '18px',
      containLabel: true,
      show: props.showGrid,
      borderColor: 'rgba(15, 23, 42, 0.05)',
    },
    xAxis: {
      type: isHorizontal ? 'value' : 'category',
      data: isHorizontal ? undefined : props.data.map(d => d.label),
      axisLine: {
        lineStyle: {
          color: 'rgba(15, 23, 42, 0.12)',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 600,
        formatter: isHorizontal ? axisValueFormatter : undefined,
        rotate: isHorizontal ? 0 : categoryLabelRotation.value,
        interval: 0,
        hideOverlap: true,
      },
      splitLine: {
        show: isHorizontal && props.showGrid,
        lineStyle: {
          color: 'rgba(15, 23, 42, 0.06)',
        },
      },
    },
    yAxis: {
      type: isHorizontal ? 'category' : 'value',
      data: isHorizontal ? props.data.map(d => d.label) : undefined,
      axisLine: {
        lineStyle: {
          color: 'rgba(15, 23, 42, 0.12)',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 600,
        formatter: !isHorizontal ? axisValueFormatter : undefined,
        width: isHorizontal ? 140 : undefined,
        overflow: isHorizontal ? 'truncate' : undefined,
        interval: 0,
        hideOverlap: true,
        align: isHorizontal ? 'left' : 'right',
      },
      splitLine: {
        show: !isHorizontal && props.showGrid,
        lineStyle: {
          color: 'rgba(15, 23, 42, 0.06)',
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
          color: '#475569',
          fontSize: 11,
          fontWeight: 600,
          formatter: (params: any) => formatChartValue(Number(params.value ?? 0)),
        } : undefined,
        emphasis: {
          itemStyle: {
            color: props.color,
            shadowBlur: 12,
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
