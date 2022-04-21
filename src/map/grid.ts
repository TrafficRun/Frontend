import { fabric } from 'fabric'
import { GameSnapshotInterface } from '@/network/server'

export interface PositionInterface {
  top: number,
  left: number
}

// 路径接口
export interface PathInterface {
  period: number,
  beginPeriod: number,
  beginNodeIndex: number,
  endNodeIndex: number
}

export interface TimeConfigInterface {
  fps: number,
  priorTime: number,
  waiteTime: number
}

// 中心时间控制
export class TimeControl {
  private mNowPeriod = 0
  private mMaxPeriod = 0
  private mLeftFrame = 0
  private mIsIdle = false

  private realFPS = 0.0
  private lastFPSCount = 0
  private lastTimestamp = 0
  private timeStepIncrCallBack : (() => void) | null = null

  // 作为配置缓冲区，赋值时使用深拷贝，保证运行时不会出现问题
  private timeConfig : TimeConfigInterface = {
    fps: 0,
    priorTime: 0,
    waiteTime: 0
  }

  public constructor (timeConfig: TimeConfigInterface, timeStepIncrFunc : (() => void) | null = null) {
    Object.assign(this.timeConfig, timeConfig)
    this.timeStepIncrCallBack = timeStepIncrFunc
  }

  public idle () : boolean {
    return this.mIsIdle
  }

  public now () : number {
    return this.mNowPeriod
  }

  public maxPeriod () : number {
    return this.mMaxPeriod
  }

  public leftFrame () : number {
    return this.mLeftFrame
  }

  public addMax () : void {
    this.mMaxPeriod += 1
  }

  public run (timeConfig: TimeConfigInterface) : void {
    if (this.mLeftFrame <= 0) {
      Object.assign(this.timeConfig, timeConfig)
      if (this.mNowPeriod >= this.mMaxPeriod) {
        // idel
        this.mIsIdle = true
        this.mLeftFrame = this.computeFrameNumber(this.timeConfig.waiteTime)
      } else {
        // run next Period
        this.mIsIdle = false
        this.mNowPeriod++
        if (this.timeStepIncrCallBack !== null) {
          this.timeStepIncrCallBack()
        }
        this.mLeftFrame = this.computeFrameNumber(this.timeConfig.priorTime)
      }
    }
    this.mLeftFrame--
    this.lastFPSCount++
    const nowTimestap = (new Date()).getTime()
    if (nowTimestap - this.lastTimestamp > 1000) {
      this.realFPS = this.lastFPSCount * 1000 / ((nowTimestap - this.lastTimestamp))
      this.lastFPSCount = 0
      this.lastTimestamp = nowTimestap
    }
  }

  // 依据时间计算帧数
  public computeFrameNumber (timeMs: number) : number {
    return Math.ceil(timeMs / 1000 * this.timeConfig.fps)
  }

  // 时间配置
  public config () : TimeConfigInterface {
    return this.timeConfig
  }
}

export interface NodeConfigInterface {
  maxSize: number,
  minSize: number,
  color: string
}

export class Node {
  private position: PositionInterface
  private nowReward = 0
  private rewards: number[] = []
  private obj: fabric.Circle
  private rewardToSize: (reward: number) => number
  private timeControl: TimeControl
  private nodeConfig: NodeConfigInterface = {
    maxSize: 0,
    minSize: 0,
    color: ''
  }

  public constructor (position: PositionInterface, nodeConfig: NodeConfigInterface, sizeTrans: (reward: number) => number, timeControl: TimeControl) {
    this.position = {
      top: position.top,
      left: position.left
    }
    Object.assign(this.nodeConfig, nodeConfig)
    this.timeControl = timeControl
    this.rewardToSize = sizeTrans
    const reposiotion = this.reposition(position)
    this.obj = new fabric.Circle({
      left: reposiotion.left,
      top: reposiotion.top,
      fill: this.nodeConfig.color,
      radius: this.rewardToSize(this.nowReward),
      selectable: false,
      evented: false
    })
  }

  public run () {
    if (this.timeControl.idle()) return
    if (this.rewards[this.timeControl.now() - 1] !== this.nowReward) {
      this.nowReward = this.rewards[this.timeControl.now() - 1]
      this.obj.set('radius', this.rewardToSize(this.nowReward))
      this.locate()
    }
  }

  public locate () {
    const reposiotion = this.reposition(this.position)
    this.obj.set('top', reposiotion.top)
    this.obj.set('left', reposiotion.left)
  }

  public getObject () : fabric.Circle {
    return this.obj
  }

  public getPosition () : PositionInterface {
    return this.position
  }

  private reposition (position: PositionInterface) : PositionInterface {
    const result = {
      left: position.left + this.nodeConfig.maxSize - this.rewardToSize(this.nowReward),
      top: position.top + this.nodeConfig.maxSize - this.rewardToSize(this.nowReward)
    }
    return result
  }

  public addReward (reward : number) {
    this.rewards.push(reward)
  }
}
export interface AgentConfigInterface {
  // 计算智能体位置需要的信息
  nodeMaxSize: number,
  size: number,
  color: string
}

export class Agent {
  private nowPosistion : PositionInterface = {
    top: 0,
    left: 0
  }

  private speed : PositionInterface = {
    top: 0,
    left: 0
  }

  private leftFrame = 0
  private actionLeftPeriod = 0
  private nowPathIndex = -1
  private paths: PathInterface[] = []
  private obj: fabric.Triangle
  private timeControl: TimeControl
  private agentConfig: AgentConfigInterface = {
    nodeMaxSize: 10,
    size: 10,
    color: '#73c0de'
  }

  private nodes: Node[]

  public constructor (position: PositionInterface, agentConfig: AgentConfigInterface, timeControl: TimeControl, nodes: Node[]) {
    this.timeControl = timeControl
    this.nodes = nodes
    Object.assign(this.agentConfig, agentConfig)
    const reposiotion = this.reposiotion(position)
    this.obj = new fabric.Triangle({
      top: reposiotion.top,
      left: reposiotion.left,
      fill: this.agentConfig.color,
      height: this.agentConfig.size,
      width: this.agentConfig.size,
      selectable: false,
      evented: false
    })
  }

  public run () {
    if (this.timeControl.idle()) return
    if (this.leftFrame === 0) {
      if (Math.abs(this.actionLeftPeriod) <= 1e-7) {
        this.nowPathIndex++
        const beginPosition = this.nodes[this.paths[this.nowPathIndex].beginNodeIndex].getPosition()
        this.actionLeftPeriod = this.paths[this.nowPathIndex].period
        this.nowPosistion.top = beginPosition.top
        this.nowPosistion.left = beginPosition.left
      }

      const actionLeftFrame = this.timeControl.computeFrameNumber(this.actionLeftPeriod * this.timeControl.config().priorTime)
      this.leftFrame = Math.min(actionLeftFrame, this.timeControl.leftFrame() + 1)

      // 计算速度
      const endPosition = this.nodes[this.paths[this.nowPathIndex].endNodeIndex].getPosition()
      const disPos : PositionInterface = {
        top: endPosition.top - this.nowPosistion.top,
        left: endPosition.left - this.nowPosistion.left
      }
      this.speed = {
        top: disPos.top / actionLeftFrame,
        left: disPos.left / actionLeftFrame
      }
      this.actionLeftPeriod -= this.leftFrame * 1000 / (this.timeControl.config().priorTime * this.timeControl.config().fps)
    }

    // 移动
    this.nowPosistion.top += this.speed.top
    this.nowPosistion.left += this.speed.left
    this.locate(this.nowPosistion)
    this.leftFrame--
  }

  public locate (position : PositionInterface) : void {
    if (position !== this.nowPosistion) {
      this.nowPosistion.top = position.top
      this.nowPosistion.left = position.left
    }
    const reposiotion = this.reposiotion(this.nowPosistion)
    this.obj.set('top', reposiotion.top)
    this.obj.set('left', reposiotion.left)
  }

  public getObject () : fabric.Triangle {
    return this.obj
  }

  public addPath (path: PathInterface) {
    if (this.paths.length === 0) {
      path.beginPeriod = 0
    } else {
      path.beginPeriod = this.paths[this.paths.length - 1].beginPeriod +
        this.paths[this.paths.length - 1].period
    }
    this.paths.push(path)
  }

  private reposiotion (position : PositionInterface) : PositionInterface {
    const result : PositionInterface = {
      top: position.top + this.agentConfig.size / 2 - this.agentConfig.nodeMaxSize,
      left: position.left + this.agentConfig.size / 2 - this.agentConfig.nodeMaxSize
    }
    return result
  }

  private getAngle (speed : PositionInterface) : number | null {
    if (speed.left === 0 && speed.top === 0) return null
    if (speed.left === 0) {
      if (speed.top < 0) return 90
      else return 270
    }
    if (speed.top > 0) {
      return Math.atan(speed.top / speed.left) / Math.PI * 180 + 180
    } else {
      return Math.atan(speed.top / speed.left) / Math.PI * 180
    }
  }
}

export class GridDraw {
  // 画布
  private canvas : fabric.Canvas
  // 高方向的节点个数
  private height = 0
  // 长方向的节点个数
  private width = 0
  // 边的宽度
  private edgeWidth = 2
  // 边的颜色
  private edgeColor = '#bbb'

  // 节点配置
  private nodeConfig : NodeConfigInterface = {
    maxSize: 10,
    minSize: 2,
    color: '#669900'
  }

  // 智能体配置
  private agentConfig : AgentConfigInterface = {
    size: 20,
    color: '#000099',
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

  private nodes: Node[] = []
  private agents: Agent[] = []

  private isContinue = true

  public constructor (dom: HTMLCanvasElement, timeStepIncrFunc : (() => void) | null = null) {
    this.canvas = new fabric.Canvas(dom)
    this.canvas.selection = false
    this.timeControl = new TimeControl(this.timeConfig, timeStepIncrFunc)
  }

  public setEnv (height: number, width: number) : void {
    this.height = height
    this.width = width
    this.draw()
  }

  private draw () : void {
    this.canvas.clear()
    const canvasHeight = this.canvas.height as number
    const canvasWidth = this.canvas.width as number
    const heightInterval = Math.floor(canvasHeight / this.height)
    const widthInterval = Math.floor(canvasWidth / this.width)
    const intervalPx = Math.min(heightInterval, widthInterval)
    const heightBf = (canvasHeight - (intervalPx * (this.height - 1)) - 2 * this.nodeConfig.maxSize) / 2
    const widthBf = (canvasWidth - (intervalPx * (this.width - 1)) - 2 * this.nodeConfig.maxSize) / 2
    // edge
    for (let loopHeight = 0; loopHeight < this.height; ++loopHeight) {
      for (let loopWidth = 0; loopWidth < this.width; ++loopWidth) {
        if (loopHeight !== 0) {
          const edge = new fabric.Line([
            widthBf + intervalPx * loopWidth + this.nodeConfig.maxSize - this.edgeWidth / 2, heightBf + intervalPx * loopHeight + this.nodeConfig.maxSize,
            widthBf + intervalPx * loopWidth + this.nodeConfig.maxSize - this.edgeWidth / 2, heightBf + intervalPx * (loopHeight - 1) + this.nodeConfig.maxSize
          ], {
            fill: this.edgeColor,
            stroke: this.edgeColor,
            strokeWidth: this.edgeWidth,
            selectable: false,
            evented: false
          })
          this.canvas.add(edge)
        }

        if (loopWidth !== 0) {
          const edge = new fabric.Line([
            widthBf + intervalPx * loopWidth + this.nodeConfig.maxSize, heightBf + intervalPx * loopHeight + this.nodeConfig.maxSize - this.edgeWidth / 2,
            widthBf + intervalPx * (loopWidth - 1) + this.nodeConfig.maxSize, heightBf + intervalPx * (loopHeight) + this.nodeConfig.maxSize - this.edgeWidth / 2
          ], {
            fill: this.edgeColor,
            stroke: this.edgeColor,
            strokeWidth: this.edgeWidth,
            selectable: false,
            evented: false
          })
          this.canvas.add(edge)
        }
      }
    }

    // node
    for (let loopHeight = 0; loopHeight < this.height; ++loopHeight) {
      for (let loopWidth = 0; loopWidth < this.width; ++loopWidth) {
        const nodePosiion : PositionInterface = {
          left: widthBf + intervalPx * loopWidth,
          top: heightBf + intervalPx * loopHeight
        }

        const nodeObj = new Node(nodePosiion, this.nodeConfig, this.getNodeSize, this.timeControl)
        this.canvas.add(nodeObj.getObject())
        this.nodes.push(nodeObj)
      }
    }
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
