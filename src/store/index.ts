import { createStore } from 'vuex'
import { TrafficServer, GameSnapshotInterface } from '@/network/server'
import { TimeConfigInterface, AgentConfigInterface, NodeConfigInterface } from '@/grid/grid'

export interface GameSettingInterface {
  timeConfig: TimeConfigInterface,
  agentConfig: AgentConfigInterface,
  nodeConfig: NodeConfigInterface
}

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
    models: {} as ModelSettings
  },
  mutations: {
    setServerHost (state, serverHost: string) {
      state.serverHost = serverHost
      state.server = new TrafficServer(serverHost)
    },
    backendInfo (state, information : string) {
      state.backendInfo = information
    },
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
