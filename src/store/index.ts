import { createStore } from 'vuex'
import { TrafficServer, GameSnapshotInterface, SettingReturnInterface } from '@/network/server'
import { TimeConfigInterface, AgentConfigInterface, NodeConfigInterface } from '@/grid/grid'

export interface GameSettingInterface {
  sumTimeStep: number,
  agentNumber: number,
  graphType: string,
  token: string,
  graph: {
    height: number,
    width: number
  },
  timeConfig: TimeConfigInterface,
  agentConfig: AgentConfigInterface,
  nodeConfig: NodeConfigInterface
}

export interface State {
  timeStep: number,
  serverHost: string,
  server: TrafficServer | undefined,
  snapshots: GameSnapshotInterface[],
  gameSetting: GameSettingInterface,
  backendInfo: string
}

export default createStore<State>({
  state: {
    timeStep: 0,
    serverHost: '127.0.0.1:53434',
    server: undefined,
    snapshots: [],
    gameSetting: {
      sumTimeStep: 0,
      agentNumber: 0,
      token: '',
      graphType: 'grid',
      graph: {
        height: 0,
        width: 0
      },
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
    },
    backendInfo: ''
  },
  mutations: {
    increaseTimeStep (state) {
      state.timeStep++
    },
    setServerHost (state, serverHost: string) {
      state.serverHost = serverHost
      state.server = new TrafficServer(serverHost)
    },
    addSnapShot (state, snapshot : GameSnapshotInterface) {
      state.snapshots.push(snapshot)
    },
    gameSetting (state, returnSetting: SettingReturnInterface) {
      state.snapshots = []
      state.gameSetting = {
        agentNumber: returnSetting.agent_number,
        graphType: returnSetting.graph_type,
        token: returnSetting.token,
        graph: {
          height: returnSetting.graph.height,
          width: returnSetting.graph.width
        },
        sumTimeStep: returnSetting.time_step,
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
    },
    backendInfo (state, information : string) {
      state.backendInfo = information
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
  },
  modules: {
  }
})
