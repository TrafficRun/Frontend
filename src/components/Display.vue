<template>
  <div class="ink-display">
      <div ref="serverRatio" id="serverRatio" style="width: 100%; height: 200px;"></div>
      <hr>
      <div ref="serverRatio1" id="serverRatio1" style="width: 100%; height: 200px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Display',
  mounted () {
    var chartDom = this.$refs.serverRatio
    var myChart = echarts.init(chartDom)
    var option = {
      title: {
        text: 'Server Ratio'
      },
      xAxis: {},
      yAxis: {},
      series: [{
        data: [
          [1, 0.1],
          [2, 0.2],
          [3, 0.3],
          [4, 0.4],
          [5, 0.5],
          [6, 0.6],
          [7, 0.7],
          [8, 0.8]
        ],
        type: 'line'
      }],
      grid: {
        left: '10%',
        right: '3%',
        bottom: '10%',
        top: '20%'
      }
    }
    myChart.setOption(option)

    var chartDom1 = this.$refs.serverRatio1
    var myChart1 = echarts.init(chartDom1)
    myChart1.setOption(option)
  }
})
</script>

<style scoped>
.ink-display {
  border-width: 1px;
  border-color: aquamarine;
  border-style: solid;
  border-radius: 10px;
  padding: 10px;
}
</style>
