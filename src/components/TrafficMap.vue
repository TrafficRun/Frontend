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

interface pathInterface {
  effect: {
    period: number
  }
  coords: Array<Array<number>>
}

const stepTime = 10

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
          }, {
            name: 'Route',
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            lineStyle: {
              width: 0
            },
            effect: {
              show: true,
              symbolSize: 5,
              symbol: 'circle',
              color: '#ffff00'
            },
            data: [] as Array<pathInterface>
          }
        ]
      },
      lines: [],
      passengers: [] as Array<Array<number>>,
      nowTime: 0,
      runHandler: 0,
      agentPath: [] as Array<pathInterface>
    }
  },
  mounted () {
    if (this.runHandler !== 0) clearInterval(this.runHandler)
    this.init_graph()
    const myChart = this.$refs.myChart as HTMLElement
    chartModel = echarts.init(myChart)
    // 清除道路初始化
    this.chartOption.series[1].data = this.passengers
    this.chartOption.series[2].data = this.agentPath
    chartModel.setOption(this.chartOption)
    this.runHandler = setInterval(this.run, stepTime * 1000)
  },
  methods: {
    init_graph () {
      const agentNumber = ManhattanRun.getAgentNumber()
      for (let loopAgent = 0; loopAgent < agentNumber; ++loopAgent) {
        this.agentPath.push({
          effect: {
            period: 0
          },
          coords: [[0, 0], [0, 0]]
        })
      }
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

      // 更新路径
      const nowAgentPath = ManhattanRun.getPath(this.nowTime)
      nowAgentPath.forEach((item, index) => {
        if (item.period === -1) return
        if (item.path === []) {
          console.log(index)
          return
        }
        this.agentPath[index].coords = item.path
        this.agentPath[index].effect.period = item.period * stepTime
      })

      this.nowTime += 1
      console.log(this.chartOption.series)
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
