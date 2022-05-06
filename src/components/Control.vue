<template>
  <el-collapse>
    <el-collapse-item>
      <template #title>
        Global <el-divider direction="vertical"></el-divider> <el-tag>{{ global.length }}</el-tag>
      </template>
      <el-form>
        <ControlItem v-model:inputValue="item.default_value" v-for="item in global" :key="item.name" :parameterItem="item" :disabled="formDisable" />
      </el-form>
    </el-collapse-item>
    <el-collapse-item>
      <template #title>
        Env <el-divider direction="vertical"></el-divider> <el-tag>{{ env.length }}</el-tag>
      </template>
      <el-form>
        <ControlItem v-model:inputValue="item.default_value" v-for="item in env" :key="item.name" :parameterItem="item" :disabled="formDisable" />
      </el-form>
    </el-collapse-item>
    <el-collapse-item v-for="configItem in extConfig" :key="configItem.name">
      <template #title>
        {{ configItem.name }} <el-divider direction="vertical"></el-divider> <el-tag>{{ configItem.parameters.length }}</el-tag>
      </template>
      <el-form>
        <ControlItem v-model:inputValue="item.default_value" v-for="item in configItem.parameters" :key="item.name" :parameterItem="item" :disabled="formDisable" />
      </el-form>
    </el-collapse-item>
  </el-collapse>
  <el-divider></el-divider>
  <el-button type="primary" @click="runTraffic" :loading="runButtonLoading" :disabled="formDisable">Running</el-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import store from '@/store'
import { ParameterItemInterface, TrafficServer, SetResultParameterInterface } from '@/network/server'
import ControlItem from './ControlItem.vue'
import { ElMessageBox } from 'element-plus'

const requestInterval = 1000

interface ExtConfigType {
  name: string,
  parameters: ParameterItemInterface[]
}

export default defineComponent({
  name: 'Control',
  components: {
    ControlItem
  },
  props: [
    'viewModelName'
  ],
  data: () => {
    return {
      global: [] as ParameterItemInterface[],
      env: [] as ParameterItemInterface[],
      extConfig: [] as ExtConfigType[],
      modelParameterIndex: 0 as number,
      generatorParameterIndex: 0 as number,
      runButtonLoading: false,
      requestTime: 0,
      getResultRetry: 0,
      formDisable: false
    }
  },
  mounted () {
    this.getCommConfig()
  },
  computed: {
    modelName () : string {
      if (this.global.length === 0) return ''
      return this.global[this.modelParameterIndex].default_value
    },
    generatorName (): string {
      if (this.global.length === 0) return ''
      return this.global[this.generatorParameterIndex].default_value
    },
    server () {
      return store.state.server
    },
    sumTimeStep () : number {
      return store.state.models[this.viewModelName].sumTimeStep
    },
    uid () : string {
      return store.state.models[this.viewModelName].uid
    }
  },
  watch: {
    modelName (newName : string, oldName : string) {
      this.server!.getModelConfig(newName).then((value) => {
        if (value !== null) {
          const modelIndex = this.extConfig.findIndex((value) => {
            return value.name === oldName
          })
          if (modelIndex === -1) {
            this.extConfig.push({
              name: newName,
              parameters: value
            })
          } else {
            this.extConfig[modelIndex] = {
              name: newName,
              parameters: value
            }
          }
        }
      })
    },
    generatorName (newName : string, oldName : string) {
      this.server!.getGeneratorConfig(newName).then((value) => {
        if (value !== null) {
          const generatorIndex = this.extConfig.findIndex((value) => {
            return value.name === oldName
          })
          if (generatorIndex === -1) {
            this.extConfig.push({
              name: newName,
              parameters: value
            })
          } else {
            this.extConfig[generatorIndex] = {
              name: newName,
              parameters: value
            }
          }
        }
      })
    },
    server (newVal : TrafficServer | undefined, oldVal : TrafficServer | undefined) {
      if (newVal === undefined) {
        return
      }
      this.getCommConfig()
    }
  },
  methods: {
    runTraffic () {
      this.runButtonLoading = true
      this.formDisable = true
      const setResultParameter : SetResultParameterInterface = {}
      this.global.forEach((value) => {
        setResultParameter[value.name] = value.default_value
      })
      this.env.forEach((value) => {
        setResultParameter[value.name] = value.default_value
      })
      this.extConfig.forEach((extValue) => {
        extValue.parameters.forEach((value) => {
          setResultParameter[value.name] = value.default_value
        })
      })
      this.server!.setBegin(setResultParameter).then((value) => {
        if (value !== null) {
          store.commit('modelSetting', {
            modelName: this.viewModelName,
            returnSetting: value
          })
          setTimeout(this.requestResult, requestInterval)
        } else {
          ElMessageBox.alert('出现错误', 'Error', {
            confirmButtonText: 'OK'
          })
        }
      }).catch((reason) => {
        this.formDisable = false
        ElMessageBox.alert(reason, 'Error', {
          confirmButtonText: 'OK'
        })
      }).finally(() => {
        this.runButtonLoading = false
      })
    },
    requestResult () {
      this.server!.getResult(this.uid, this.requestTime).then((value) => {
        this.getResultRetry = 0
        if (value !== null) {
          this.requestTime += 1
          store.commit('addSnapShot', {
            modelName: this.viewModelName,
            snapshot: value
          })
        }
      }).catch((reason) => {
        this.getResultRetry++
        if (this.getResultRetry >= 3) {
          ElMessageBox.alert('网络失败次数达到上限，原因：' + reason, 'Error', {
            confirmButtonText: 'OK'
          })
        }
      }).finally(() => {
        if (this.requestTime < this.sumTimeStep && this.getResultRetry < 3) {
          setTimeout(this.requestResult, requestInterval)
        }
      })
    },
    getCommConfig () {
      if (this.server === undefined) {
        return
      }
      this.server.getCommConfig().then((result) => {
        if (result !== null) {
          this.global = result.global
          this.env = result.env
          this.modelParameterIndex = this.global.findIndex((value) => {
            return value.name === 'model_name'
          })
          this.generatorParameterIndex = this.global.findIndex((value) => {
            return value.name === 'generator_name'
          })
        }
      })
    }
  }
})
</script>

<style scoped>
</style>
