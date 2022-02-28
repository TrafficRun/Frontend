<template>
  <el-form-item :label="parameter.name" v-if="parameter.type === 'string'">
    <el-tooltip
      effect="light"
      :content="parameter.description"
      placement="right"
    >
      <el-input v-model="inputValue2" @input="updateValue" :disabled="isDisable"></el-input>
    </el-tooltip>
  </el-form-item>
  <el-form-item :label="parameter.name" v-if="parameter.type === 'bool'">
    <el-tooltip
      effect="light"
      :content="parameter.description"
      placement="right"
    >
      <el-switch v-model="inputValue2" @input="updateValue" :disabled="isDisable"></el-switch>
    </el-tooltip>
  </el-form-item>
  <el-form-item :label="parameter.name" v-if="parameter.type === 'int'">
    <el-tooltip
      effect="light"
      :content="parameter.description"
      placement="right"
    >
      <el-input-number v-model="inputValue2" @input="updateValue" :disabled="isDisable"></el-input-number>
    </el-tooltip>
  </el-form-item>
  <el-form-item :label="parameter.name" v-if="parameter.type === 'float'">
    <el-tooltip
      effect="light"
      :content="parameter.description"
      placement="right"
    >
      <el-input-number v-model="inputValue2" @input="updateValue" :precision="10" :disabled="isDisable"></el-input-number>
    </el-tooltip>
  </el-form-item>
  <el-form-item :label="parameter.name" v-if="parameter.type === 'range'">
    <el-tooltip
      effect="light"
      :content="parameter.description"
      placement="right"
    >
      <el-slider v-model="inputValue2" @input="updateValue" :disabled="isDisable" :min="getRangeExtType(parameter).min" :max="getRangeExtType(parameter).max" :step="getRangeExtType(parameter).is_continue === 1?1e-5:1"></el-slider>
    </el-tooltip>
  </el-form-item>
  <el-form-item :label="parameter.name" v-if="parameter.type === 'enum'">
    <el-tooltip
      effect="light"
      :content="parameter.description"
      placement="right"
    >
      <el-select v-model="inputValue2" @visible-change="updateValue" :disabled="isDisable">
        <el-option
          v-for="enumItem in getEnumOptions(parameter)"
          :value="enumItem"
          :key="enumItem"
          :label="enumItem"
        >
        </el-option>
      </el-select>
    </el-tooltip>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ParameterEnumExtInterface, ParameterItemInterface, ParameterItemTypeEnum, ParameterRangeExtInterface } from '@/network/server'

const disableNameList = [
  'online',
  'server',
  'port'
]

export default defineComponent({
  name: 'ControlItem',
  props: {
    parameterItem: null as any,
    inputValue: null as any
  },
  emits: ['update:inputValue'],
  data () {
    return {
      inputValue2: null as any
    }
  },
  mounted () {
    this.inputValue2 = this.inputValue
    if (this.parameter.name === 'online') {
      this.inputValue2 = true
    }
  },
  computed: {
    parameter () {
      return this.parameterItem as ParameterItemInterface
    },
    isDisable () {
      const parameterName = this.parameter.name
      if (disableNameList.find((value) => { return parameterName === value }) === undefined) {
        return false
      }
      return true
    }
  },
  methods: {
    getEnumOptions (parameterItem: ParameterItemInterface) : string[] {
      if (parameterItem.type === ParameterItemTypeEnum.Enum) {
        const extData = parameterItem.ext_slot as ParameterEnumExtInterface
        return extData
      }
      return []
    },
    getRangeExtType (parameterItem: ParameterItemInterface) : ParameterRangeExtInterface {
      if (parameterItem.type === ParameterItemTypeEnum.Range) {
        return parameterItem.ext_slot as ParameterRangeExtInterface
      }
      return null as unknown as ParameterRangeExtInterface
    },
    updateValue (data : string | number | boolean) : void {
      this.$emit('update:inputValue', this.inputValue2)
    }
  }
})
</script>
