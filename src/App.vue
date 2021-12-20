<template>
  <div class="container">
    <div class="row">
      <nav class="navbar navbar-dark" style="background-color: #e3f2fd;">
        <h2>Traffic Show</h2>
      </nav>
    </div>
    <br>
    <div class="row">
      <div class="col">
        <Control />
      </div>
      <div class="col-6">
        <TrafficMap />
      </div>
      <div class="col">
        <Display />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TrafficMap from './components/TrafficMap.vue'
import Display from './components/Display.vue'
import Control from './components/Control.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

export default defineComponent({
  name: 'App',
  components: {
    TrafficMap,
    Display,
    Control
  }
})
</script>
