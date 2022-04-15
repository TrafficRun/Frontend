<template>
  <div class="map" ref="gridmapcontainer">
    <canvas ref="gridmap"></canvas>
  </div>
</template>

<script lang="ts">
import { GridDraw } from '@/grid/grid'
import store, { GameSettingInterface, ModelSettingInterface } from '@/store/index'
import { defineComponent } from 'vue'

const gridDraws: (GridDraw | null)[] = []

export default defineComponent({
  name: 'GridMap',
  data () {
    return {
      gridDrawIndex: 0
    }
  },
  props: [
    'modelName'
  ],
  methods: {
    createDraw (gameSetting : GameSettingInterface, ModelSetting : ModelSettingInterface) {
      const drawCanvasContainer = this.$refs.gridmapcontainer as HTMLElement
      const drawCanvas = this.$refs.gridmap as HTMLCanvasElement
      drawCanvas.height = drawCanvasContainer.clientHeight
      drawCanvas.width = drawCanvasContainer.clientWidth
      const gridDraw = new GridDraw(drawCanvas, () => {
        store.commit('increaseTimeStep', this.modelName)
      })
      gridDraws[this.gridDrawIndex] = gridDraw

      gridDraws[this.gridDrawIndex]!.setEnv(ModelSetting.graph.height, ModelSetting.graph.width)
      gridDraws[this.gridDrawIndex]!.setAgentNumber(ModelSetting.agentNumber)
      gridDraws[this.gridDrawIndex]!.render()
    }
  },
  computed: {
    gameSetting () {
      return store.state.gameSetting
    },
    snapshots () {
      return store.state.models[this.modelName].snapshots
    },
    snapshotLen () {
      return store.state.models[this.modelName].snapshots.length
    },
    modelSetting () {
      return store.state.models[this.modelName]
    },
    modelToken () {
      return store.state.models[this.modelName].token
    }
  },
  watch: {
    modelToken (newVal : string) {
      if (gridDraws[this.gridDrawIndex] !== null) {
        gridDraws[this.gridDrawIndex]!.stop()
      }
      this.createDraw(this.gameSetting, this.modelSetting)
      console.log(gridDraws[this.gridDrawIndex])
    },
    snapshotLen (newVal : number) {
      store.state.models[this.modelName].snapshots.slice(gridDraws[this.gridDrawIndex]!.pathSetTime()).forEach((value) => {
        gridDraws[this.gridDrawIndex]!.addSnapshots(value)
      })
    }
  },
  mounted () {
    this.gridDrawIndex = gridDraws.length
    gridDraws.push(null)
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
