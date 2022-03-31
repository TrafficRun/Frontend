<template>
  <el-container>
    <el-header class="header-board">
      <el-row>
        <el-col :span="23">
          <h3>Traffic Map</h3>
        </el-col>
        <el-col :span="1">
          <h3>
            <el-button @click="drawer = true">
              <el-icon>
                <Menu />
              </el-icon>
            </el-button>
          </h3>
        </el-col>
      </el-row>
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
  <el-drawer v-model="drawer">
  <template #title>
    <h4>Set</h4>
  </template>
  <template #default>
    <el-form :model="setting">
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
import GridMap from './components/GridMap.vue'
import Display from './components/Display.vue'
import Control from './components/Control.vue'
import { ElMessageBox } from 'element-plus'
import store from '@/store/index'
import { Menu, Sort } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'App',
  components: {
    GridMap,
    Display,
    Control,
    Menu,
    Sort
  },
  data () {
    return {
      drawer: false,
      setting: {
        serverName: ''
      }
    }
  },
  mounted () {
    this.openMessage()
  },
  methods: {
    reconnect () {
      store.commit('setServerHost', this.setting.serverName)
    },
    openMessage () {
      ElMessageBox.prompt('请输入后端服务器IP和端口，如：127.0.0.1:8080', 'Tip', {
        confirmButtonText: 'OK',
        showCancelButton: false,
        inputValue: 't340-1.ink19.cn:53434'
      }).then(({ value }) => {
        this.setting.serverName = value
        store.commit('setServerHost', value)
        store.dispatch('backendInfo')
      })
    }
  },
  computed: {
    backendInfo () {
      return store.state.backendInfo
    }
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
