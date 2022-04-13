<template>
<el-container>
  <el-aside width="300px" class="my-container">
  <Control :view-model-name="modelName" />
  </el-aside>
  <el-main class="my-container map-container">
    <GridMap :model-name="modelName" />
  </el-main>
</el-container>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import GridMap from './GridMap.vue'
import Control from './Control.vue'

const props = defineProps<{
  modelName: string
}>()

</script>

<style scoped>
.map-container {
  border-left: 1px solid var(--el-border-color-base);
  border-right: 1px solid var(--el-border-color-base);
}
.my-container {
  padding: 10px;
}
</style>
