import { createStore } from 'vuex'

export interface State {
  timeStep: number,
  sumTimeStep: number
}

export default createStore<State>({
  state: {
    timeStep: 0,
    sumTimeStep: 0
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
