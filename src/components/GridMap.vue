<template>
  <div ref="gridmap" class="map"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as echarts from 'echarts'
import 'echarts/lib/component/grid'

const gridWidth = 10
const gridHeight = 10
const agentNumber = 20
const rewardNumber = 20

const priodSecond = 5

let gridEchart : null | echarts.ECharts = null

interface PointInterface {
  name: string,
  value: number[]
}

interface EdgeInterface {
  source: string,
  target: string
}

interface AgentInterface {
  name: string,
  index: number,
  path: number[]
}

interface AgentPathInterface {
  coords: number[][],
  effect: {
    period: number
  }
}

export default defineComponent({
  name: 'GridMap',
  data () {
    return {
      chartOptions: {
        title: {
          text: 'Traffic Map'
        },
        xAxis: {
          show: false,
          type: 'value',
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          show: false,
          type: 'value',
          min: 'dataMin',
          max: 'dataMax'
        },
        series: [{
          type: 'graph',
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          symboSize: 20,
          roam: true,
          edgeSymbolSize: 4,
          data: [] as any,
          links: [] as any
        }, {
          name: 'Route',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          polyline: true,
          lineStyle: {
            width: 0
          },
          effect: {
            show: true,
            symbolSize: 20,
            symbol: 'circle',
            color: '#ff0000',
            trailLength: 0,
            loop: true
          },
          animation: false,
          data: [] as any
        }]
      },
      agents: [] as AgentInterface[]
    }
  },
  mounted () {
    const chartDom = this.$refs.gridmap as HTMLElement
    for (let loopHeight = 0; loopHeight < gridHeight; ++loopHeight) {
      for (let loopWidth = 0; loopWidth < gridWidth; ++loopWidth) {
        const node = {
          name: (loopHeight * gridWidth + loopWidth).toString(),
          value: [loopWidth * 50 + 50, loopHeight * 50 + 50]
        }
        this.chartOptions.series[0].data.push(node)
        if (loopHeight !== 0) {
          const edge = {
            source: ((loopHeight - 1) * gridWidth + loopWidth).toString(),
            target: ((loopHeight) * gridWidth + loopWidth).toString()
          }
          this.chartOptions.series[0].links.push(edge)
        }
        if (loopWidth !== 0) {
          const edge = {
            source: ((loopHeight) * gridWidth + loopWidth - 1).toString(),
            target: ((loopHeight) * gridWidth + loopWidth).toString()
          }
          this.chartOptions.series[0].links.push(edge)
        }
      }
    }
    for (let loopAgent = 0; loopAgent < agentNumber; ++loopAgent) {
      const randomPosition = Math.floor(Math.random() * gridWidth * gridHeight)
      const agentItem = {
        name: loopAgent.toString(),
        index: loopAgent,
        path: [randomPosition, randomPosition]
      } as AgentInterface
      this.agents.push(agentItem)
      this.chartOptions.series[1].data.push({
        coords: [
          [this.chartOptions.series[0].data[randomPosition].value[0], this.chartOptions.series[0].data[randomPosition].value[1]],
          [this.chartOptions.series[0].data[randomPosition].value[0], this.chartOptions.series[0].data[randomPosition].value[1]]
        ],
        effect: {
          period: priodSecond
        }
      } as AgentPathInterface)
    }
    gridEchart = echarts.init(chartDom)
    if (gridEchart !== null) {
      gridEchart.setOption(this.chartOptions)
    }
    setInterval(this.run, priodSecond * 1000)
  },
  methods: {
    run () {
      this.agents.forEach((value) => {
        const choosePoint = []
        const nowPosition = value.path[value.path.length - 1]
        if (nowPosition / gridWidth >= 1) {
          choosePoint.push(nowPosition - gridWidth)
        }
        if (nowPosition / gridWidth < gridHeight - 1) {
          choosePoint.push(nowPosition + gridWidth)
        }
        if (nowPosition % gridHeight !== 0) {
          choosePoint.push(nowPosition - 1)
        }
        if (nowPosition % gridHeight !== gridWidth - 1) {
          choosePoint.push(nowPosition + 1)
        }
        const nextPosition = choosePoint[Math.floor(Math.random() * choosePoint.length)]
        value.path.push(nextPosition)
        this.chartOptions.series[1].data[value.index].coords.push([this.chartOptions.series[0].data[nextPosition].value[0], this.chartOptions.series[0].data[nextPosition].value[1]])
        this.chartOptions.series[1].data[value.index].effect.period += priodSecond
      })
      if (gridEchart !== null) {
        gridEchart.setOption(this.chartOptions)
      }
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
