<template>
  <div class="map" ref="myChart" id="myChart"></div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import gcoord from 'gcoord'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TrafficMap',
  data: () => {
    return {
      simplePoints: [],
      chartOption: {
        animation: false,
        bmap: {
          center: [-73.96423175103598, 40.78055665558648],
          zoom: 13,
          roam: false,
          mapStyleV2: {
            styleId: 'daec037e78e517014e8b5ff369cb3892'
          }
        },
        series: [
          {
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            data: [],
            silent: true,
            lineStyle: {
              color: 'rgb(200, 35, 45)',
              opacity: 0.2,
              width: 3
            },
            progressiveThreshold: 500,
            progressive: 200
          }
        ]
      },
      lines: []
    }
  },
  mounted () {
    const myChart = this.$refs.myChart
    const chartModel = echarts.init(myChart)
    chartModel.setOption(this.chartOption)
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
