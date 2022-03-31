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
  size: number,
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
          size: 2 + Math.random() * 8,
          obj: null as unknown as fabric.Circle
        } as NodeInterface
        const node = new fabric.Circle({
          left: tempNode.position.left + this.nodeMaxSize - tempNode.size,
          top: tempNode.position.top + this.nodeMaxSize - tempNode.size,
          fill: this.nodeColor,
          radius: tempNode.size,
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
    this.agents.forEach((value) => {
      if (value.actionLeftFrame <= 0) {
        if (value.nowIndex >= value.path.length) {
          value.actionLeftFrame = Math.floor(this.minWaitTime / 1000 * this.fps)
          value.speed = {
            top: 0,
            left: 0
          }
          return
        }
        const nextEdge = value.path[value.nowIndex]
        const countFrame = Math.floor(this.priorTime / 1000 * this.fps)
        const nowPosition = this.nodes[nextEdge.beginNodeIndex].position
        const nextPosition = this.nodes[nextEdge.endNodeIndex].position
        value.nowPosition.left = nowPosition.left
        value.nowPosition.top = nowPosition.top
        value.actionLeftFrame = countFrame
        value.speed = {
          top: (nextPosition.top - value.nowPosition.top) / countFrame,
          left: (nextPosition.left - value.nowPosition.left) / countFrame
        }
        value.nowIndex++
      }
      value.actionLeftFrame--
      value.nowPosition.left += value.speed.left
      value.nowPosition.top += value.speed.top
      value.obj.set('top', value.nowPosition.top)
      value.obj.set('left', value.nowPosition.left)
      value.obj.setCoords()
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
    snapshot.agents.forEach((value) => {
      const periodPerEdge = value.period / value.path.length
      value.path.forEach((pvalue, index) => {
        if (index === 0) return
        this.agents[value.agent_id].path.push({
          beginNodeIndex: value.path[index - 1],
          endNodeIndex: pvalue,
          period: periodPerEdge
        } as PathInterface)
      })
    })
  }

  public pathSetTime () : number {
    return this.rewards.length
  }
}
