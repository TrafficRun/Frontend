<template>
  <div class="map" ref="myChart" id="myChart"></div>
</template>

<script lang="ts">
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import { defineComponent } from 'vue'
import { ManhattanRun } from '../traffic/manhattan'
import store from '@/store'

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
const driversBatchSize = 1000

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
            symbolSize: 2,
            data: [] as Array<Array<number>>,
            itemStyle: {
              color: '#ddb926'
            },
            z: 2
          }
        ] as Array<any>
      },
      lines: [],
      passengers: [] as Array<Array<number>>,
      runHandler: null as NodeJS.Timer | null,
      agentPath: [] as Array<Array<pathInterface>>
    }
  },
  mounted () {
    if (this.runHandler !== null) clearInterval(this.runHandler)
    const myChart = this.$refs.myChart as HTMLElement
    chartModel = echarts.init(myChart)
    const batchNumber = Math.ceil(ManhattanRun.getAgentNumber() / driversBatchSize)
    for (let loopDriverBatch = 0; loopDriverBatch < batchNumber; ++loopDriverBatch) {
      const tagentPath = [] as Array<pathInterface>
      this.agentPath.push(tagentPath)
      this.chartOption.series.push({
        name: 'Route',
        type: 'lines',
        coordinateSystem: 'bmap',
        polyline: true,
        lineStyle: {
          width: 0
        },
        effect: {
          show: true,
          symbolSize: 2,
          symbol: 'circle',
          color: '#ffff00',
          trailLength: 0,
          loop: true
        },
        data: tagentPath,
        animation: false,
        z: 1,
        progressive: 0,
        progressiveThreshold: 10000,
        silent: true
      })
    }
    this.chartOption.series[1].data = this.passengers
    this.init_graph()
    chartModel.setOption(this.chartOption)
    store.commit('setSumTimeStep', ManhattanRun.getTimeStep())
    this.runHandler = setInterval(this.run, stepTime * 1000)
  },
  methods: {
    init_graph () {
      const agentNumber = ManhattanRun.getAgentNumber()
      for (let loopAgent = 0; loopAgent < agentNumber; ++loopAgent) {
        const batchIndex = Math.floor(loopAgent / driversBatchSize)
        this.agentPath[batchIndex].push({
          effect: {
            period: 0
          },
          coords: [[0, 0], [0, 0]]
        })
      }
    },
    run () {
      // 更新服务点
      if (this.timeStep >= ManhattanRun.getTimeStep()) {
        if (this.runHandler !== null) {
          clearInterval(this.runHandler)
        }
        return 0
      }
      this.passengers.splice(0, this.passengers.length)
      ManhattanRun.getRequests(this.timeStep).forEach((item) => {
        this.passengers.push(item)
      })

      // 更新路径
      const nowAgentPath = ManhattanRun.getPath(this.timeStep)
      nowAgentPath.forEach((item, index) => {
        const batchIndex = Math.floor(index / driversBatchSize)
        const batchInIndex = index % driversBatchSize
        if (item.period === -1) {
          if (this.timeStep === ManhattanRun.getTimeStep() - 1) {
            this.agentPath[batchIndex][batchInIndex].coords = [
              this.agentPath[batchIndex][batchInIndex].coords[this.agentPath[batchIndex][batchInIndex].coords.length - 1],
              this.agentPath[batchIndex][batchInIndex].coords[this.agentPath[batchIndex][batchInIndex].coords.length - 1]
            ]
            this.agentPath[batchIndex][batchInIndex].effect.period = stepTime
          }
          return
        }
        if (item.path.length === 1) {
          this.agentPath[batchIndex][batchInIndex].coords = [item.path[0], item.path[0]]
        } else {
          this.agentPath[batchIndex][batchInIndex].coords = item.path
        }
        this.agentPath[batchIndex][batchInIndex].effect.period = item.period * stepTime
      })

      store.commit('increaseTimeStep')
      chartModel.setOption({
        series: this.chartOption.series
      })
      return 0
    },
    fake_run () {
      if (store.state.timeStep >= 96) {
        if (this.runHandler !== null) {
          clearInterval(this.runHandler)
        }
        return 0
      }
      store.commit('increaseTimeStep')
    }
  },
  computed: {
    timeStep: function () {
      return store.state.timeStep
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
