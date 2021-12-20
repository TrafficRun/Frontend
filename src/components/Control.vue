<template>
  <div class="ink-control">
    <div>
      <div class="mb-3">
        <label for="timeStep" class="form-label">Time Step</label>
        <input type="number" class="form-control" id="timeStep" />
      </div>
      <div class="mb-3">
        <label for="driverNumber" class="form-label">Driver Num</label>
        <input type="number" class="form-control" id="driverNumber" />
      </div>
      <div class="mb-3">
        <label for="requestRatio" class="form-label">Req Ratio</label>
        <input type="range" id="requestRatio" class="form-range" />
      </div>
      <div class="mb-3">
        <label for="timeStep" class="form-label">Time Step</label>
        <input type="number" class="form-control" id="timeStep" />
      </div>
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary" @click="clear">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Control'
})
</script>

<style scoped>
.ink-control {
  border-width: 1px;
  border-color: aquamarine;
  border-style: solid;
  border-radius: 10px;
  padding: 10px;
}
</style>
