<template>
  <div class="ink-display">
      <div ref="serverRatio" id="serverRatio" style="width: 100%; height: 250px;"></div>
  </div>
  <br>
  <div>
    <div style="cursor: pointer;" v-for="status in modelStatus" :key="status.name" @click="changeModelSelect(status)">
      <el-progress
      :percentage="status.timeStep / status.maxTimeStep * 100"
      :stroke-width="20"
      :text-inside="true"
      :color="processColor(status)"
      >
        {{ status.name }}
      </el-progress>
      <br>
    </div>
  </div>
</template>

<script lang='ts'>
import * as echarts from 'echarts'
import { defineComponent } from 'vue'
import store from '@/store'

interface SeriesDataInterface {
  data: number[][],
  type: string,
  name: string
}

interface ModelStatus {
  name: string,
  maxTimeStep: number,
  timeStep: number,
  show: boolean,
  color: string
}

let mySuccessChart : echarts.ECharts = null as unknown as echarts.ECharts
const modelIndex : {
  [key : string] : number
} = {}

export default defineComponent({
  name: 'Display',
  data () {
    return {
      myOption: {
        legend: {
          bottom: 0,
          type: 'scroll'
        },
        title: {
          text: 'Server Num'
        },
        xAxis: {
          min: 0,
          max: 0
        },
        yAxis: {},
        series: [] as SeriesDataInterface[],
        grid: {
          left: '10%',
          right: '3%',
          bottom: '20%',
          top: '20%'
        }
      },
      actionNum: 0,
      dataStore: [] as SeriesDataInterface[],
      modelStatus: [] as ModelStatus[]
    }
  },
  mounted () {
    const chartDom = this.$refs.serverRatio as HTMLElement
    mySuccessChart = echarts.init(chartDom)
    this.myOption.xAxis.max = 24
    this.myOption.series = this.dataStore
    mySuccessChart.setOption(this.myOption)
    console.log(mySuccessChart)
    mySuccessChart.on('legendselectchanged', (event) => {
      const mevent = event as {
        type: string,
        name: string,
        selected: {
          [name: string]: boolean
        }
      }
      for (const modelName in mevent.selected) {
        const mindex = modelIndex[modelName]
        this.modelStatus[mindex].show = mevent.selected[modelName]
      }
    })
  },
  computed: {
    maxTimeStep () {
      return store.state.maxTimeStep
    },
    displayActionLen () {
      return store.state.displayAction.length
    }
  },
  watch: {
    maxTimeStep: function (newVal: number) {
      this.myOption.xAxis.max = newVal
      mySuccessChart.setOption(this.myOption)
    },
    displayActionLen: function (newVal: number) {
      store.state.displayAction.slice(this.actionNum, newVal).forEach((action) => {
        if (action.action === 'add') {
          modelIndex[action.modelName] = this.dataStore.length
          this.dataStore.push({
            data: [],
            type: 'line',
            name: action.modelName
          })
          mySuccessChart.setOption(this.myOption)
          const modelColor = mySuccessChart.getVisual({
            dataIndex: modelIndex[action.modelName],
            seriesIndex: modelIndex[action.modelName]
          }, 'color') as string
          this.modelStatus.push({
            name: action.modelName,
            maxTimeStep: action.data,
            timeStep: 0,
            show: true,
            color: modelColor
          })
        } else {
          const changeIndex = modelIndex[action.modelName]
          this.dataStore[changeIndex].data.push([
            this.dataStore[changeIndex].data.length,
            action.data
          ])
          mySuccessChart.setOption(this.myOption)
          this.modelStatus[changeIndex].timeStep++
        }
      })
      this.actionNum = newVal
    }
  },
  methods: {
    processColor (status: ModelStatus) : string {
      if (status.show === false) {
        return '#CCCCCC'
      }
      if (status.maxTimeStep === status.timeStep) {
        return '#67c23a'
      }
      return status.color
    },
    changeModelSelect (status : ModelStatus) {
      console.log('test')
      mySuccessChart.dispatchAction({
        type: 'legendToggleSelect',
        name: status.name
      })
    }
  }
})
</script>
