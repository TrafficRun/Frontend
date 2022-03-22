import { createStore } from 'vuex'
import { TrafficServer } from '@/network/server'

export interface State {
  timeStep: number,
  sumTimeStep: number,
  serverHost: string,
  server: TrafficServer | undefined
}

export default createStore<State>({
  state: {
    timeStep: 0,
    sumTimeStep: 0,
    serverHost: '127.0.0.1:53434',
    server: undefined
  },
  mutations: {
    setSumTimeStep (state, n : number) {
      state.sumTimeStep = n
    },
    increaseTimeStep (state) {
      state.timeStep++
    },
    setServerHost (state, serverHost: string) {
      state.serverHost = serverHost
      state.server = new TrafficServer(serverHost)
    }
  },
  actions: {
  },
  modules: {
  }
})
