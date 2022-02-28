import { createStore } from 'vuex'

export interface State {
  timeStep: number,
  sumTimeStep: number,
  serverHost: string
}

export default createStore<State>({
  state: {
    timeStep: 0,
    sumTimeStep: 0,
    serverHost: '127.0.0.1:53434'
  },
  mutations: {
    setSumTimeStep (state, n : number) {
      state.sumTimeStep = n
    },
    increaseTimeStep (state) {
      state.timeStep++
    }
  },
  actions: {
  },
  modules: {
  }
})
