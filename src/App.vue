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
      <el-main>
        <el-tabs type="card" addable @tab-add="addModel">
          <el-tab-pane :label="model.name" v-for="model in models" :key="model.name">
            <RunModel :model-name="model.name">
            </RunModel>
          </el-tab-pane>
        </el-tabs>
      </el-main>
      <el-aside width="300px" class="my-container">
        <Display />
      </el-aside>
    </el-container>
  </el-container>
  <Setting v-model:drawer="drawer"></Setting>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Display from './components/Display.vue'
import RunModel from './components/RunModel.vue'
import Setting from './components/Setting.vue'
import { ElMessageBox } from 'element-plus'
import store from '@/store/index'
import { Menu } from '@element-plus/icons-vue'

interface ModelViewInterface {
  name: string
}

export default defineComponent({
  name: 'App',
  components: {
    Display,
    Menu,
    Setting,
    RunModel
  },
  data () {
    return {
      drawer: false,
      setting: {
        serverName: ''
      },
      models: [{
        name: 'default'
      }] as ModelViewInterface[]
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
    },
    addModel () {
      this.models.push({
        name: 'Model ' + this.models.length
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
