import { createStore } from 'vuex'
import { TrafficServer, GameSnapshotInterface, SettingReturnInterface } from '@/network/server'
import { TimeConfigInterface, AgentConfigInterface, NodeConfigInterface } from '@/grid/grid'

export interface GameSettingInterface {
  timeConfig: TimeConfigInterface,
  agentConfig: AgentConfigInterface,
  nodeConfig: NodeConfigInterface
}

export interface ModelSettingInterface {
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

export interface ModelSettingsInterface {
  [key : string] : ModelSettingInterface
}

export interface DisplayActionInterface {
  action: string, // add update
  modelName: string
  data: number
}

export default createStore({
  state: {
    serverHost: '127.0.0.1:53434',
    server: undefined as TrafficServer | undefined,
    gameSetting: {
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
    } as GameSettingInterface,
    backendInfo: '',
    models: {} as ModelSettingsInterface,
    displayAction: [] as DisplayActionInterface[],
    maxTimeStep: 24
  },
  mutations: {
    setServerHost (state, serverHost: string) {
      state.serverHost = serverHost
      state.server = new TrafficServer(serverHost)
    },
    backendInfo (state, information : string) {
      state.backendInfo = information
    },
    addModel (state, modelName: string) {
      state.models[modelName] = {
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
    modelSetting (state, { modelName, returnSetting } : { modelName: string, returnSetting: SettingReturnInterface }) {
      state.models[modelName].agentNumber = returnSetting.agent_number
      state.models[modelName].graph = returnSetting.graph
      state.models[modelName].graphType = returnSetting.graph_type
      state.models[modelName].sumTimeStep = returnSetting.time_step
      state.models[modelName].token = returnSetting.token
      if (state.models[modelName].sumTimeStep > state.maxTimeStep) {
        state.maxTimeStep = state.models[modelName].sumTimeStep
      }
      state.displayAction.push({
        action: 'add',
        modelName: modelName,
        data: state.models[modelName].sumTimeStep
      })
    },
    addSnapShot (state, { modelName, snapshot } : { modelName: string, snapshot : GameSnapshotInterface }) {
      state.models[modelName].snapshots.push(snapshot)
    },
    increaseTimeStep (state, modelName: string) {
      state.models[modelName].timeStep++
      state.displayAction.push({
        action: 'update',
        modelName: modelName,
        data: state.models[modelName].snapshots[state.models[modelName].timeStep - 1].gain
      })
    }
  },
  actions: {
    backendInfo (context) {
      if (context.state.server !== null) {
        context.state.server!.getVersion().then((value) => {
          if (value !== null) {
            context.commit('backendInfo', value.version)
          }
        })
      }
    }
  }
})
