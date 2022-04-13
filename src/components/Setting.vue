<template>
<el-drawer v-model="mDrawer">
<template #title>
  <h4>Set</h4>
</template>
<template #default>
  <el-form :model="setting" disabled>
    <el-collapse>
      <el-collapse-item title="Server Config">
        <el-form-item label="Server Name">
          <el-row>
            <el-col :span="18">
              <el-input v-model="setting.serverName"></el-input>
            </el-col>
            <el-col :offset="2" :span="4">
              <el-button @click="reconnect">
                <el-icon><Sort /></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="Time Config">
        <el-form-item label="Perior Time(ms)">
          <el-input v-model="setting.timeConfig.priorTime"></el-input>
        </el-form-item>
        <el-form-item label="Waite Time(ms)">
          <el-input v-model="setting.timeConfig.waiteTime"></el-input>
        </el-form-item>
        <el-form-item label="FPS">
          <el-input v-model="setting.timeConfig.fps"></el-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="Agent Config">
        <el-form-item label="Agent Color">
          <el-color-picker v-model="setting.agentConfig.color"></el-color-picker>
        </el-form-item>
        <el-form-item label="Agent Size">
          <el-input v-model="setting.agentConfig.size"></el-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="Node Config">
        <el-form-item label="Node Color">
          <el-color-picker v-model="setting.nodeConfig.color"></el-color-picker>
        </el-form-item>
        <el-form-item label="Node Min Size">
          <el-input v-model="setting.nodeConfig.minSize"></el-input>
        </el-form-item>
        <el-form-item label="Node Max Size">
          <el-input v-model="setting.nodeConfig.maxSize"></el-input>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>
<template #footer>
  <h5>
    {{ backendInfo }}
  </h5>
  <el-divider />
  <el-button type="primary">OK</el-button>
</template>
</el-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Sort } from '@element-plus/icons-vue'
import store from '@/store/index'

export default defineComponent({
  name: 'Setting',
  components: {
    Sort
  },
  props: ['drawer'],
  emits: ['update:drawer'],
  data () {
    return {
      mDrawer: false,
      setting: {
        serverName: '',
        nodeConfig: {
          maxSize: 10,
          minSize: 2,
          color: '#5470c6'
        },
        agentConfig: {
          size: 20,
          color: '#73c0de',
          nodeMaxSize: 10
        },
        timeConfig: {
          fps: 20,
          priorTime: 3000,
          waiteTime: 300
        }
      }
    }
  },
  mounted () {
    Object.assign(this.setting.timeConfig, this.gameSetting.timeConfig)
    Object.assign(this.setting.agentConfig, this.gameSetting.agentConfig)
    Object.assign(this.setting.nodeConfig, this.gameSetting.nodeConfig)
  },
  methods: {
    reconnect () {
      store.commit('setServerHost', this.setting.serverName)
    }
  },
  computed: {
    backendInfo () {
      return store.state.backendInfo
    },
    serverHost () {
      return store.state.serverHost
    },
    gameSetting () {
      return store.state.gameSetting
    }
  },
  watch: {
    mDrawer () {
      this.$emit('update:drawer', this.mDrawer)
    },
    drawer () {
      this.mDrawer = this.drawer
    },
    serverHost () {
      this.setting.serverName = this.serverHost
    }
  }
})
</script>
