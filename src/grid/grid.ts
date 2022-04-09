import { fabric } from 'fabric'
import { GameSnapshotInterface } from '@/network/server'

interface PositionInterface {
  top: number,
  left: number
}

// 节点接口类型
interface NodeInterface {
  // 节点的位置
  position: PositionInterface,
  // 节点的大小
  nowReward: number,
  // 收益数量列表
  rewards: number[],
  // 节点在图中的对象
  obj: fabric.Circle
}

// 收益接口
interface RewardInterface {
  nodeIndex: number
}

// 路径接口
interface PathInterface {
  period: number,
  beginPeriod: number,
  beginNodeIndex: number,
  endNodeIndex: number
}

// 智能体的接口
interface AgentInterface {
  nowPosition: PositionInterface,
  speed: PositionInterface,
  actionLeftFrame: number,
  nowIndex: number,
  path: PathInterface[],
  obj: fabric.Circle
}

interface TimePeriodControl {
  nowPeriod: number,
  maxPeriod: number,
  leftFrame: number,
  fps: number,
  priorTime: number,
  idle: boolean
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
  // 节点最大的大小
  private nodeMaxSize = 10
  // 节点最小大小
  private nodeMinSize = 2
  // 边的颜色
  private edgeColor = '#bbb'
  // 节点的颜色
  private nodeColor = '#5470c6'
  // 智能体的颜色
  private agentColor = '#73c0de'
  // 智能体的大小
  private agentSize = 10
  private nodes: NodeInterface[] = []
  private agents: AgentInterface[] = []
  private rewards: RewardInterface[][] = []

  // draw Control
  private minWaitTime = 300 // ms
  private priorTime = 3000 // ms
  private fps = 30
  private isContinue = true

  // 时间控制缓存区
  private periodControl : TimePeriodControl = {
    nowPeriod: 0,
    maxPeriod: 0,
    leftFrame: 0,
    fps: this.fps,
    priorTime: this.priorTime,
    idle: false
  }

  public constructor (dom: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(dom)
    this.canvas.selection = false
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
    const heightBf = (canvasHeight - (intervalPx * (this.height - 1)) - 2 * this.nodeMaxSize) / 2
    const widthBf = (canvasWidth - (intervalPx * (this.width - 1)) - 2 * this.nodeMaxSize) / 2
    // edge
    for (let loopHeight = 0; loopHeight < this.height; ++loopHeight) {
      for (let loopWidth = 0; loopWidth < this.width; ++loopWidth) {
        if (loopHeight !== 0) {
          const edge = new fabric.Line([
            widthBf + intervalPx * loopWidth + this.nodeMaxSize - this.edgeWidth / 2, heightBf + intervalPx * loopHeight + this.nodeMaxSize,
            widthBf + intervalPx * loopWidth + this.nodeMaxSize - this.edgeWidth / 2, heightBf + intervalPx * (loopHeight - 1) + this.nodeMaxSize
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
            widthBf + intervalPx * loopWidth + this.nodeMaxSize, heightBf + intervalPx * loopHeight + this.nodeMaxSize - this.edgeWidth / 2,
            widthBf + intervalPx * (loopWidth - 1) + this.nodeMaxSize, heightBf + intervalPx * (loopHeight) + this.nodeMaxSize - this.edgeWidth / 2
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
        const tempNode = {
          position: {
            left: widthBf + intervalPx * loopWidth,
            top: heightBf + intervalPx * loopHeight
          },
          nowReward: 0,
          obj: null as unknown as fabric.Circle,
          rewards: []
        } as NodeInterface
        const node = new fabric.Circle({
          left: tempNode.position.left + this.nodeMaxSize - (this.getNodeSize(tempNode.nowReward)),
          top: tempNode.position.top + this.nodeMaxSize - (this.getNodeSize(tempNode.nowReward)),
          fill: this.nodeColor,
          radius: (this.getNodeSize(tempNode.nowReward)),
          selectable: false,
          evented: false
        })

        tempNode.obj = node
        this.nodes.push(tempNode)
        this.canvas.add(node)
      }
    }
  }

  public setAgentNumber (agentNumber : number) : void {
    for (let loopAgent = 0; loopAgent < agentNumber; ++loopAgent) {
      const tempNodeIndex = 0
      const tempAgent = {
        nowIndex: 0,
        path: [],
        obj: null as unknown as fabric.Circle,
        nowPosition: {
          top: this.nodes[tempNodeIndex].position.top + this.nodeMaxSize - this.agentSize,
          left: this.nodes[tempNodeIndex].position.left + this.nodeMaxSize - this.agentSize
        },
        speed: {
          top: 0,
          left: 0
        },
        actionLeftFrame: 0
      } as AgentInterface

      const agentObj = new fabric.Circle({
        left: tempAgent.nowPosition.left,
        top: tempAgent.nowPosition.top,
        fill: this.agentColor,
        radius: this.agentSize,
        selectable: false,
        evented: false
      })

      tempAgent.obj = agentObj
      this.agents.push(tempAgent)
      this.canvas.add(agentObj)
    }
  }

  public run () : void {
    if (this.periodControl.leftFrame === 0) {
      if (this.periodControl.maxPeriod > this.periodControl.nowPeriod) {
        this.periodControl.nowPeriod++
        this.periodControl.leftFrame = this.priorTime / 1000 * this.fps
        this.periodControl.idle = false
        this.periodControl.fps = this.fps
        this.periodControl.priorTime = this.priorTime
      } else {
        this.periodControl.leftFrame = this.minWaitTime / 1000 * this.fps
        this.periodControl.idle = true
      }
    }
    this.periodControl.leftFrame--

    // 如果正在挂机状态，就不运行接下来的内容，使得整个状态处于冻结状态
    if (this.periodControl.idle) return

    this.agents.forEach((value, agentIndex) => {
      if (value.actionLeftFrame <= 0) {
        // 判断是否应该进入下一个路径
        if (value.nowIndex < value.path.length && value.path[value.nowIndex].beginPeriod + value.path[value.nowIndex].period <= this.periodControl.nowPeriod - 1) {
          value.nowIndex++
          if (value.nowIndex > value.path.length) {
            console.error('Something Error. agent index: ' + agentIndex + ', now index: ' + value.nowIndex + ', path len: ' + value.path.length)
            return
          } else {
            const nextEdge = value.path[value.nowIndex]
            const nowPosition = this.nodes[nextEdge.beginNodeIndex].position
            value.nowPosition.left = nowPosition.left
            value.nowPosition.top = nowPosition.top
          }
        }

        const nextEdge = value.path[value.nowIndex]
        const leftFrame = Math.floor(((nextEdge.beginPeriod + nextEdge.period) - this.periodControl.nowPeriod + 1) * this.periodControl.priorTime / 1000 * this.fps)
        const countFrame = Math.min(leftFrame, this.periodControl.leftFrame + 1)
        const lastPosition = this.nodes[nextEdge.beginNodeIndex].position
        const nextPosition = this.nodes[nextEdge.endNodeIndex].position
        value.actionLeftFrame = countFrame
        value.speed = {
          top: (nextPosition.top - lastPosition.top) / (nextEdge.period * this.periodControl.priorTime / 1000 * this.fps),
          left: (nextPosition.left - lastPosition.left) / (nextEdge.period * this.periodControl.priorTime / 1000 * this.fps)
        }
      }
      value.actionLeftFrame--
      value.nowPosition.left += value.speed.left
      value.nowPosition.top += value.speed.top
      value.obj.set('top', value.nowPosition.top)
      value.obj.set('left', value.nowPosition.left)
      value.obj.setCoords()
    })

    this.nodes.forEach((value) => {
      if (value.rewards[this.periodControl.nowPeriod - 1] !== value.nowReward) {
        value.nowReward = value.rewards[this.periodControl.nowPeriod - 1]
        value.obj.set('radius', this.getNodeSize(value.nowReward))
        value.obj.set('left', value.position.left + this.nodeMaxSize - (this.getNodeSize(value.nowReward)))
        value.obj.set('top', value.position.top + this.nodeMaxSize - (this.getNodeSize(value.nowReward)))
      }
    })
  }

  public render () : void {
    if (this.isContinue) {
      setTimeout(() => {
        this.run()
        this.canvas.renderAll()
        this.render()
      }, 1000 / this.fps)
    }
  }

  public stop () : void {
    this.isContinue = false
  }

  public addSnapshots (snapshot : GameSnapshotInterface) : void {
    this.rewards.push(snapshot.rewards.map((value) => {
      return {
        nodeIndex: value
      } as RewardInterface
    }))

    // 添加智能体路径
    snapshot.agents.forEach((value) => {
      const periodPerEdge = value.period / value.path.length
      value.path.forEach((pvalue, index) => {
        if (index === 0) return
        let beginPeriod = 0
        const pathLen = this.agents[value.agent_id].path.length
        if (pathLen !== 0) {
          beginPeriod = this.agents[value.agent_id].path[pathLen - 1].beginPeriod +
            this.agents[value.agent_id].path[pathLen - 1].period
        }
        this.agents[value.agent_id].path.push({
          beginNodeIndex: value.path[index - 1],
          endNodeIndex: pvalue,
          period: periodPerEdge,
          beginPeriod: beginPeriod
        } as PathInterface)
      })
    })

    // 添加节点收益
    this.nodes.forEach((pvalue, index) => {
      pvalue.rewards.push(
        snapshot.rewards.filter((value) => {
          return value === index
        }).length
      )
    })

    this.periodControl.maxPeriod += 1
  }

  public pathSetTime () : number {
    return this.rewards.length
  }

  private getNodeSize (reward : number) {
    return this.nodeMinSize + (this.nodeMaxSize - this.nodeMinSize) * (2 / (1 + Math.exp(-reward)) - 1)
  }
}
