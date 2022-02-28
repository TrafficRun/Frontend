<template>
  <div class="comm-layout">
    <el-container>
      <el-header class="header-board">
        <h3>Traffic Map</h3>
      </el-header>
      <el-container class="main-container">
        <el-aside width="300px" class="my-container">
          <Control />
        </el-aside>
        <el-main class="my-container map-container">
          <GridMap />
        </el-main>
        <el-aside width="300px" class="my-container">
          <Display />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import TrafficMap from './components/TrafficMap.vue'
import GridMap from './components/GridMap.vue'
import Display from './components/Display.vue'
import Control from './components/Control.vue'

export default defineComponent({
  name: 'App',
  components: {
    GridMap,
    Display,
    Control
  }
})
</script>

<style scoped>
.header-board {
  border-bottom: 1px solid var(--el-border-color-base);
}
.main-container {
  padding-top: 20px;
}
.map-container {
  border-left: 1px solid var(--el-border-color-base);
  border-right: 1px solid var(--el-border-color-base);
}
.my-container {
  padding: 10px;
}
</style>
