import { fabric } from 'fabric'
import { GameSnapshotInterface } from '@/network/server'
import { NodeConfigInterface,
  AgentConfigInterface,
  TimeConfigInterface,
  TimeControl,
  Agent,
  Node,
  PathInterface,
  PositionInterface
} from './grid'

interface EdgeInterface {
  beginNodeIndex: number,
  endNodeIndex: number
}

class Traffic {
  // 画布
  private canvas : fabric.Canvas
  // 边的宽度
  private edgeWidth = 2
  // 边的颜色
  private edgeColor = '#bbb'

  // 节点配置
  private nodeConfig : NodeConfigInterface = {
    maxSize: 10,
    minSize: 2,
    color: '#5470c6'
  }

  // 智能体配置
  private agentConfig : AgentConfigInterface = {
    size: 20,
    color: '#73c0de',
    nodeMaxSize: this.nodeConfig.maxSize
  }

  // 时间配置
  private timeConfig : TimeConfigInterface = {
    fps: 20,
    priorTime: 3000,
    waiteTime: 300
  }

  // 时间控制
  private timeControl : TimeControl

  private edges: EdgeInterface[] = []
  private nodes: Node[] = []
  private agents: Agent[] = []
  private isContinue = true

  public constructor (dom: HTMLCanvasElement, timeStepIncrFunc : (() => void) | null = null) {
    this.canvas = new fabric.Canvas(dom)
    this.canvas.selection = false
    this.timeControl = new TimeControl(this.timeConfig, timeStepIncrFunc)
  }

  public setEnv (nodes : PositionInterface[], edges : EdgeInterface) {
    // 
  }

  public setAgentNumber (agentNumber : number) : void {
    for (let loopAgent = 0; loopAgent < agentNumber; ++loopAgent) {
      const tempNodeIndex = 0
      const agentPosiion : PositionInterface = {
        top: this.nodes[tempNodeIndex].getPosition().top,
        left: this.nodes[tempNodeIndex].getPosition().left
      }

      const agentObj = new Agent(agentPosiion, this.agentConfig, this.timeControl, this.nodes)
      this.canvas.add(agentObj.getObject())
      this.agents.push(agentObj)
    }
  }

  public run () : void {
    this.timeControl.run(this.timeConfig)
    this.agents.forEach((value) => {
      value.run()
    })
    this.nodes.forEach((value) => {
      value.run()
    })
  }

  public render (randerTime = 0) : void {
    const beginTimestamp = (new Date()).getTime()
    const countIntervalTimestamp = 1000 / this.timeControl.config().fps
    let runIntervalTimestamp = 0
    if (randerTime <= countIntervalTimestamp) {
      runIntervalTimestamp = countIntervalTimestamp - randerTime
    } else {
      runIntervalTimestamp = 0
    }
    if (this.isContinue) {
      setTimeout(() => {
        this.run()
        this.canvas.renderAll()
        const nowTimestap = (new Date()).getTime()
        this.render(nowTimestap - beginTimestamp)
      }, runIntervalTimestamp)
    }
  }

  public stop () : void {
    this.isContinue = false
  }

  public addSnapshots (snapshot : GameSnapshotInterface) : void {
    // 添加智能体路径
    snapshot.agents.forEach((value) => {
      const periodPerEdge = value.period / (value.path.length - 1)
      value.path.forEach((pvalue, index) => {
        if (index === 0) return
        this.agents[value.agent_id].addPath({
          beginNodeIndex: value.path[index - 1],
          endNodeIndex: pvalue,
          period: periodPerEdge,
          beginPeriod: 0
        } as PathInterface)
      })
    })

    // 添加节点收益
    this.nodes.forEach((pvalue, index) => {
      pvalue.addReward(
        snapshot.rewards.filter((value) => {
          return value === index
        }).length
      )
    })

    this.timeControl.addMax()
  }

  public pathSetTime () : number {
    return this.timeControl.maxPeriod()
  }

  private getNodeSize (reward : number) {
    return this.nodeConfig.minSize + (this.nodeConfig.maxSize - this.nodeConfig.minSize) * (2 / (1 + Math.exp(-reward)) - 1)
  }
}
