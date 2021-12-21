<template>
  <div class="map" ref="myChart" id="myChart"></div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import { defineComponent } from 'vue'
import streets from '../data/street_manhattan.json'

// let streets = {}

export default defineComponent({
  name: 'TrafficMap',
  data: () => {
    return {
      streetPath: [],
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
            data: [],
            silent: true,
            lineStyle: {
              color: 'rgb(200, 35, 45)',
              opacity: 2,
              width: 1
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
    this.init_street()
    console.log(this.streetPath.length)
    this.chartOption.series[0].data = this.streetPath
    chartModel.setOption(this.chartOption)
  },
  methods: {
    init_street () {
      console.log(streets.features.length)
      streets.features.forEach((value) => {
        if (value.geometry.type !== 'MultiLineString') {
          this.streetPath.push({
            coords: value.geometry.coordinates
          })
        } else {
          value.geometry.coordinates.forEach((tvalue) => {
            this.streetPath.push({
              coords: tvalue
            })
          })
        }
      })
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
