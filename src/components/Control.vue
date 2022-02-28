<template>
    <el-collapse>
      <el-collapse-item>
        <template #title>
          Global <el-divider direction="vertical"></el-divider> <el-tag>{{ global.length }}</el-tag>
        </template>
        <el-form>
          <ControlItem v-model:inputValue="item.default_value" v-for="item in global" :key="item.name" :parameterItem="item" />
        </el-form>
      </el-collapse-item>
      <el-collapse-item>
        <template #title>
          Env <el-divider direction="vertical"></el-divider> <el-tag>{{ env.length }}</el-tag>
        </template>
        <el-form>
          <ControlItem v-model:inputValue="item.default_value" v-for="item in env" :key="item.name" :parameterItem="item" />
        </el-form>
      </el-collapse-item>
      <el-collapse-item v-for="configItem in extConfig" :key="configItem.name">
        <template #title>
          {{ configItem.name }} <el-divider direction="vertical"></el-divider> <el-tag>{{ configItem.parameters.length }}</el-tag>
        </template>
        <el-form>
          <ControlItem v-model:inputValue="item.default_value" v-for="item in configItem.parameters" :key="item.name" :parameterItem="item" />
        </el-form>
      </el-collapse-item>
    </el-collapse>
    <el-divider></el-divider>
    <el-button type="primary" @click="runTraffic">运行</el-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ParameterItemInterface, TrafficServer, getParameterDefaultValue } from '@/network/server'
import ControlItem from './ControlItem.vue'

const trafficServer : TrafficServer = new TrafficServer('t340-1.ink19.cn:53434')

interface ExtConfigType {
  name: string,
  parameters: ParameterItemInterface[]
}

export default defineComponent({
  name: 'Control',
  components: {
    ControlItem
  },
  data: () => {
    return {
      global: [] as ParameterItemInterface[],
      env: [] as ParameterItemInterface[],
      extConfig: [] as ExtConfigType[],
      modelParameterIndex: 0 as number,
      generatorParameterIndex: 0 as number
    }
  },
  mounted () {
    trafficServer.getCommConfig().then((result) => {
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
  },
  computed: {
    modelName () : string {
      if (this.global.length === 0) return ''
      return this.global[this.modelParameterIndex].default_value
    },
    generatorName (): string {
      if (this.global.length === 0) return ''
      return this.global[this.generatorParameterIndex].default_value
    }
  },
  watch: {
    modelName (newName : string, oldName : string) {
      trafficServer.getModelConfig(newName).then((value) => {
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
      trafficServer.getGeneratorConfig(newName).then((value) => {
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
    }
  },
  methods: {
    runTraffic () {
      console.log('Begin Run')
    }
  }
})
</script>

<style scoped>
</style>
