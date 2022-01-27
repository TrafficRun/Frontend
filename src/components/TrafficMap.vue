<template>
  <div class="map" ref="myChart" id="myChart"></div>
</template>

<script lang="ts">
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import { defineComponent } from 'vue'
import { ManhattanRun } from '../traffic/manhattan'

interface lineInterface {
  coords: Array<Array<number>>
}

let chartModel : echarts.ECharts = null as unknown as echarts.ECharts

export default defineComponent({
  name: 'TrafficMap',
  data: () => {
    return {
      streetPath: [] as Array<lineInterface>,
      chartOption: {
        animation: false,
        bmap: {
          center: [-73.96423175103598, 40.78055665558648],
          zoom: 13,
          roam: true,
          mapStyleV2: {
            styleId: 'daec037e78e517014e8b5ff369cb3892'
          }
        },
        series: [
          {
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            data: [] as Array<lineInterface>,
            silent: true,
            lineStyle: {
              color: '#3366CC',
              opacity: 0.2,
              width: 1
            },
            progressiveThreshold: 500,
            progressive: 200
          }, {
            type: 'scatter',
            coordinateSystem: 'bmap',
            symbol: 'circle',
            symbolSize: 5,
            data: [] as Array<Array<number>>,
            itemStyle: {
              color: '#ddb926'
            }
          }
        ]
      },
      lines: [],
      passengers: [] as Array<Array<number>>,
      nowTime: 0,
      runHandler: 0
    }
  },
  mounted () {
    if (this.runHandler !== 0) clearInterval(this.runHandler)
    const myChart = this.$refs.myChart as HTMLElement
    chartModel = echarts.init(myChart)
    // 清除道路初始化
    // this.init_street()
    // this.chartOption.series[0].data = this.streetPath
    this.chartOption.series[1].data = this.passengers
    chartModel.setOption(this.chartOption)
    this.runHandler = setInterval(this.run, 1000)
  },
  methods: {
    init_street () {
      ManhattanRun.getLines().forEach((lineItem) => {
        this.streetPath.push({
          coords: lineItem
        })
      })
    },
    run () {
      // 更新服务点
      if (this.nowTime >= ManhattanRun.getTimeStep()) {
        clearInterval(this.runHandler)
        return 0
      }
      this.passengers.splice(0, this.passengers.length)
      ManhattanRun.getRequests(this.nowTime).forEach((item) => {
        this.passengers.push(item)
      })
      console.log(this.passengers.length)
      this.nowTime += 1
      chartModel.setOption({
        series: this.chartOption.series
      })
      return 0
    }
  }
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 700px;
  position: relative;
}
</style>
