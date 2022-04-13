import { GameSnapshotInterface, SettingReturnInterface } from '@/network/server'

interface ModelSetting {
  timeStep: number,
  sumTimeStep: number,
  agentNumber: number,
  graphType: string,
  token: string,
  graph: {
    height: number,
    width: number
  },
  snapshots: GameSnapshotInterface[],
  modelName: string
}

export interface ModelSettings {
  [key : string] : ModelSetting
}

export default {
  state: () => ({} as ModelSettings),
  mutations: {
    addModel (state : ModelSettings, modelName: string) {
      state[modelName] = {
        timeStep: 0,
        sumTimeStep: 24,
        agentNumber: 0,
        graphType: '',
        token: '',
        graph: {
          height: 0,
          width: 0
        },
        snapshots: [],
        modelName: modelName
      }
    },
    modelSetting (state : ModelSettings, { modelName, returnSetting } : { modelName: string, returnSetting: SettingReturnInterface }) {
      state[modelName].agentNumber = returnSetting.agent_number
      state[modelName].graph = returnSetting.graph
      state[modelName].graphType = returnSetting.graph_type
      state[modelName].sumTimeStep = returnSetting.time_step
      state[modelName].token = returnSetting.token
    },
    addSnapShot (state : ModelSettings, { modelName, snapshot } : { modelName: string, snapshot : GameSnapshotInterface }) {
      state[modelName].snapshots.push(snapshot)
    },
    increaseTimeStep (state : ModelSettings, modelName: string) {
      state[modelName].timeStep++
    }
  },
  actions: {},
  getters: {}
}
