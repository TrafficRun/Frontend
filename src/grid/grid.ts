import { fabric } from 'fabric'

interface PositionInterface {
  top: number,
  left: number
}

interface NodeInterface {
  position: PositionInterface,
  size: number,
  obj: fabric.Circle,
}

interface AgentInterface {
  nowPosition: PositionInterface,
  speed: PositionInterface,
  actionLeftFrame: number,
  nowIndex: number,
  path: number[],
  obj: fabric.Circle
}
export class GridDraw {
  private canvas : fabric.Canvas
  private height = 0
  private width = 0
  private edgeWidth = 2
  private nodeMaxSize = 10
  private edgeColor = '#bbb'
  private nodeColor = '#5470c6'
  private agentColor = '#73c0de'
  private agentSize = 10
  private nodes: NodeInterface[] = []
  private agents: AgentInterface[] = []
  private minWaitTime = 300 // ms
  private priorTime = 3000 // ms
  private fps = 30

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
      const tempNodeIndex = Math.floor(this.nodes.length * Math.random())
      const tempAgent = {
        nowIndex: 0,
        path: [tempNodeIndex, tempNodeIndex],
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
    this.agents.forEach((value, index) => {
      if (value.actionLeftFrame <= 0) {
        if (value.nowIndex === value.path.length - 1) {
          value.actionLeftFrame = Math.floor(this.minWaitTime / 1000 * this.fps)
          value.speed = {
            top: 0,
            left: 0
          }
          return
        }
        const nextPosition = this.nodes[value.path[value.nowIndex + 1]].position
        const countFrame = Math.floor(this.priorTime / 1000 * this.fps)
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
    setInterval(() => {
      this.run()
      this.canvas.renderAll()
    }, 1000 / this.fps)
  }

  public setAgentPath () : void {
    this.agents.forEach((value) => {
      const lastPos = value.path[value.path.length - 1]
      const choicePos : number[] = []
      if (lastPos / this.width >= 1) {
        choicePos.push(lastPos - this.width)
      }
      if (lastPos / this.width < this.height - 1) {
        choicePos.push(lastPos + this.width)
      }
      if (lastPos % this.width !== 0) {
        choicePos.push(lastPos - 1)
      }
      if (lastPos % this.width !== this.width - 1) {
        choicePos.push(lastPos + 1)
      }
      const nextPos = choicePos[Math.floor(Math.random() * choicePos.length)]
      value.path.push(nextPos)
    })
  }
}
