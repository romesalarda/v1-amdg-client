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
  height?: string
  color?: string
  smooth?: boolean
  showGrid?: boolean
  label?: string
  valueUnit?: string
  valueFormatter?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  color: '#0a192f', // deep-navy
  smooth: true,
  showGrid: true,
})

const formatChartValue = (value: number) => {
  if (props.valueFormatter) return props.valueFormatter(value)
  return props.valueUnit ? `${value.toLocaleString('en-GB')} ${props.valueUnit}` : value.toLocaleString('en-GB')
}

const option = computed(() => ({
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
    formatter: (params: any) => {
      const point = params[0]
      return `<div style="padding: 4px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
        <div style="color: #64748b;">${props.label || 'Value'}: <strong>${formatChartValue(Number(point.value ?? point.data ?? 0))}</strong></div>
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
    borderColor: 'rgba(15, 23, 42, 0.05)',
  },
  xAxis: {
    type: 'category',
    data: props.labels,
    boundaryGap: false,
    axisLine: {
      lineStyle: {
        color: 'rgba(15, 23, 42, 0.12)',
      },
    },
    axisLabel: {
      color: '#64748b',
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
      color: '#64748b',
      fontSize: 11,
      formatter: (value: number) => formatChartValue(value),
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(15, 23, 42, 0.06)',
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
  height: v-bind(height);
  width: 100%;
}
</style>
