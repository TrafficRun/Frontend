<template>
  <div class="ink-display">
      <div ref="serverRatio" id="serverRatio" style="width: 100%; height: 200px;"></div>
  </div>
</template>

<script lang='ts'>
import * as echarts from 'echarts'
import { defineComponent } from 'vue'
import store from '@/store'
import mreward from '@/data/reward.json'

let mySuccessChart : echarts.ECharts = null as unknown as echarts.ECharts

export default defineComponent({
  name: 'Display',
  data () {
    return {
      successData: [] as number[][],
      myOption: {
        title: {
          text: 'Server Ratio'
        },
        xAxis: {
          min: 0,
          max: 0
        },
        yAxis: {},
        series: [{
          data: [] as number[][],
          type: 'line'
        }],
        grid: {
          left: '10%',
          right: '3%',
          bottom: '10%',
          top: '20%'
        }
      }
    }
  },
  mounted () {
    const chartDom = this.$refs.serverRatio as HTMLElement
    mySuccessChart = echarts.init(chartDom)
    this.myOption.xAxis.max = 24
    this.myOption.series[0].data = this.successData
    mySuccessChart.setOption(this.myOption)
  },
  computed: {
    sumTimeStep () {
      return store.state.gameSetting.sumTimeStep
    },
    timeStep () {
      return store.state.timeStep
    },
    snapshots () {
      return store.state.snapshots
    }
  },
  watch: {
    sumTimeStep: function (newVal: number) {
      this.myOption.xAxis.max = newVal
      mySuccessChart.setOption(this.myOption)
    },
    timeStep: function (newVal: number) {
      if (newVal === 0) {
        return
      }
      console.log('Test')
      this.successData.push([newVal, this.snapshots[newVal - 1].gain])
      mySuccessChart.setOption(this.myOption)
    }
  }
})
</script>
