<template>
  <div class="map" ref="gridmapcontainer">
    <canvas ref="gridmap"></canvas>
  </div>
</template>

<script lang="ts">
import { GridDraw } from '@/grid/grid'
import { defineComponent } from 'vue'

let gridDraw: null | GridDraw = null

const priorTime = 4

export default defineComponent({
  name: 'GridMap',
  data () {
    return {}
  },
  mounted () {
    const drawCanvasContainer = this.$refs.gridmapcontainer as HTMLElement
    const drawCanvas = this.$refs.gridmap as HTMLCanvasElement
    drawCanvas.height = drawCanvasContainer.clientHeight
    drawCanvas.width = drawCanvasContainer.clientWidth
    console.log(drawCanvas.height, drawCanvas.width)
    gridDraw = new GridDraw(drawCanvas)
    gridDraw.setEnv(10, 10)
    gridDraw.setAgentNumber(20)
    gridDraw.render()
    setInterval(this.run, priorTime * 1000)
  },
  methods: {
    run () {
      if (gridDraw !== null) {
        gridDraw.setAgentPath()
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
