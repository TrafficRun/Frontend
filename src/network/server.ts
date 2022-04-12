/* eslint-disable camelcase */

import axios from 'axios'
import qs from 'qs'

export type ParameterEnumExtInterface = Array<string>
export interface ParameterRangeExtInterface {
  max: number,
  min: number,
  is_continue: number
}

export enum ParameterItemTypeEnum {
  Int = 'int',
  Float = 'float',
  String = 'string',
  Range = 'range',
  Enum = 'enum',
  Bool = 'bool'
}

interface GameSnapshotPathInterface {
  agent_id: number,
  path: number[],
  period: number
}

export interface GameSnapshotInterface {
  time_step: number,
  agents: GameSnapshotPathInterface[],
  rewards: number[],
  gain: number
}

export interface ParameterItemInterface {
  name: string,
  description: string,
  type: ParameterItemTypeEnum,
  default_value: any,
  ext_slot: ParameterEnumExtInterface | ParameterRangeExtInterface | null
}

export interface CommConfigReturnInterface {
  global: ParameterItemInterface[],
  env: ParameterItemInterface[]
}

export interface SetResultParameterInterface {
  [key : string]: string | number
}

export interface GraphGridInterface {
  height: number,
  width: number
}

export interface SettingReturnInterface {
  time_step: number,
  graph_type: string,
  agent_number: number,
  token: string,
  graph: GraphGridInterface
}

export interface VersionInterface {
  version: string
}

export type ModelConfigReturnInterFace = ParameterItemInterface[]
export type GeneratorConfigReturnInterFace = ParameterItemInterface[]

export interface ServerReturnType {
  code: number,
  data?:
    CommConfigReturnInterface
    | ModelConfigReturnInterFace
    | GeneratorConfigReturnInterFace
    | SettingReturnInterface
    | GameSnapshotInterface
    | VersionInterface
}

export function getParameterDefaultValue (parameter: ParameterItemInterface) : any {
  if (parameter.type === ParameterItemTypeEnum.Enum) {
    const extData = parameter.ext_slot as ParameterEnumExtInterface
    return extData[parameter.default_value as number]
  }
  return parameter.default_value
}

export class TrafficServer {
  public serverName = ''
  public constructor (pServerName : string) {
    this.serverName = pServerName
  }

  public async getCommConfig () : Promise<CommConfigReturnInterface | null> {
    const requestUrl = this.generateUri('comm_config')
    const { data } = await axios.get(requestUrl)
    const sData = data as ServerReturnType
    if (sData.code === 0) {
      const result = sData.data as CommConfigReturnInterface
      result.env = result.env.map((value) => {
        value.default_value = getParameterDefaultValue(value)
        return value
      })
      result.global = result.global.map((value) => {
        value.default_value = getParameterDefaultValue(value)
        return value
      })
      return result
    }
    return null
  }

  public async getModelConfig (modelName: string) : Promise<ModelConfigReturnInterFace | null> {
    const requestUrl = this.generateUri('model_config?model_name=' + modelName)
    const { data } = await axios.get(requestUrl)
    const sData = data as ServerReturnType
    if (sData.code === 0) {
      let result = sData.data as ModelConfigReturnInterFace
      result = result.map((value) => {
        value.default_value = getParameterDefaultValue(value)
        return value
      })
      return result
    }
    return null
  }

  public async getGeneratorConfig (generatorName: string) : Promise<GeneratorConfigReturnInterFace | null> {
    const requestUrl = this.generateUri('generator_config?generator_name=' + generatorName)
    const { data } = await axios.get(requestUrl)
    const sData = data as ServerReturnType
    if (sData.code === 0) {
      let result = sData.data as GeneratorConfigReturnInterFace
      result = result.map((value) => {
        value.default_value = getParameterDefaultValue(value)
        return value
      })
      return result
    }
    return null
  }

  public async setBegin (parameter : SetResultParameterInterface) : Promise<SettingReturnInterface | null> {
    const requestUrl = this.generateUri('begin_simulate')
    const { data } = await axios.post(requestUrl, qs.stringify(parameter))
    const sData = data as ServerReturnType
    if (sData.code === 0) {
      const result = sData.data as SettingReturnInterface
      return result
    }
    return null
  }

  public async getResult (token : string, timestep : number) : Promise<GameSnapshotInterface | null> {
    const requestUrl = this.generateUri('simulate_result?time_step=' + timestep + '&token=' + token)
    const { data } = await axios.get(requestUrl)
    const sData = data as ServerReturnType
    if (sData.code === 0) {
      const result = sData.data as GameSnapshotInterface
      return result
    }
    return null
  }

  public async getVersion () : Promise<null | VersionInterface> {
    const requestUrl = this.generateUri('version')
    const { data } = await axios.get(requestUrl)
    const sData = data as ServerReturnType
    if (sData.code === 0) {
      const result = sData.data as VersionInterface
      return result
    }
    return null
  }

  private generateUri (pUri :string) : string {
    return 'http://' + this.serverName + '/' + pUri
  }
}
