<template>
  <div class="map" ref="gridmapcontainer">
    <canvas ref="gridmap"></canvas>
  </div>
</template>

<script lang="ts">
import { GridDraw } from '@/grid/grid'
import store, { GameSettingInterface } from '@/store'
import { defineComponent } from 'vue'
import { GameSnapshotInterface } from '@/network/server'

let gridDraw: null | GridDraw = null

export default defineComponent({
  name: 'GridMap',
  data () {
    return {}
  },
  methods: {
    createDraw (gameSetting : GameSettingInterface) {
      const drawCanvasContainer = this.$refs.gridmapcontainer as HTMLElement
      const drawCanvas = this.$refs.gridmap as HTMLCanvasElement
      drawCanvas.height = drawCanvasContainer.clientHeight
      drawCanvas.width = drawCanvasContainer.clientWidth
      gridDraw = new GridDraw(drawCanvas, () => {
        store.commit('increaseTimeStep')
      })
      gridDraw.setEnv(gameSetting.graph.height, gameSetting.graph.width)
      gridDraw.setAgentNumber(gameSetting.agentNumber)
      gridDraw.render()
    }
  },
  computed: {
    gameSetting () {
      return store.state.gameSetting
    },
    snapshots () {
      return store.state.snapshots
    },
    snapshotLen () {
      return store.state.snapshots.length
    }
  },
  watch: {
    gameSetting (newVal : GameSettingInterface) {
      if (gridDraw !== null) {
        gridDraw.stop()
      }
      this.createDraw(newVal)
      console.log(gridDraw)
    },
    snapshotLen (newVal : number) {
      store.state.snapshots.slice(gridDraw!.pathSetTime()).forEach((value) => {
        gridDraw!.addSnapshots(value)
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
