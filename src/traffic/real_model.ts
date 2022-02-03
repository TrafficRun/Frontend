interface PathType<PointType> {
  path: Array<PointType>
  period: number
}

interface NeighbourType {
  h3ToGeo: {
    [key: string]: Array<number>
  }
  geoToH3: Array<string>
}

export class RealModel<PointType> {
  private readonly lines: Array<Array<PointType>>
  private readonly indexLines: Array<Array<number>>
  private readonly points: Array<PointType>
  private readonly timeStep: number
  private readonly requests: Array<Array<PointType>>
  private readonly driveKeyPoint: Array<Array<number>>
  private readonly agentNumber: number
  private drivePath: Array<Array<PathType<PointType>>> = []
  private neighbour: NeighbourType
  constructor (lines: Array<Array<number>>,
    points: Array<PointType>,
    requests: Array<Array<number>>,
    driveKeyPoint: Array<Array<number>>,
    neighbour: NeighbourType,
    drivePath: Array<Array<PathType<PointType>>>
    ) {
    this.indexLines = lines
    this.points = points
    this.neighbour = neighbour
    this.requests = requests.map((itemPerTime) => {
      const requestPerTime = [] as Array<PointType>
      itemPerTime.forEach((itemReqNum, itemIndex) => {
        for (let i = 0; i < itemReqNum; ++i) {
          requestPerTime.push(points[itemIndex])
        }
      })
      return requestPerTime
    })

    this.lines = lines.map((perLine) => {
      return perLine.map((point) => {
        return this.points[point]
      })
    })

    this.timeStep = requests.length
    this.driveKeyPoint = driveKeyPoint
    this.agentNumber = this.driveKeyPoint[0].length
    this.drivePath = drivePath
    // this.generatePath()
  }

  public getLines () : Array<Array<PointType>> {
    return this.lines
  }

  public getPoints () : Array<PointType> {
    return this.points
  }

  public getAgentNumber () :number {
    return this.agentNumber
  }

  public getPath (timeStep: number): Array<PathType<PointType>> {
    return this.drivePath[timeStep]
  }

  public getPaths (): Array<Array<PathType<PointType>>> {
    return this.drivePath
  }

  public getRequests (timeStep: number) : Array<PointType> {
    return this.requests[timeStep]
  }

  public getTimeStep (): number {
    return this.timeStep
  }

  private generatePath () {
    for (let loopTime = 0; loopTime < this.timeStep - 1; ++loopTime) {
      const perTimePath : Array<PathType<PointType>> = []
      for (let loopAgent = 0; loopAgent < this.agentNumber; ++loopAgent) {
        if (this.driveKeyPoint[loopTime][loopAgent] === -1) {
          perTimePath.push({
            path: [],
            period: -1
          })
          continue
        }
        let nextTime = 0
        for (let loopNextTime = loopTime + 1; loopNextTime < this.timeStep; ++loopNextTime) {
          if (this.driveKeyPoint[loopNextTime][loopAgent] !== -1) {
            nextTime = loopNextTime
            break
          }
        }
        const edge = [this.driveKeyPoint[loopTime][loopAgent], this.driveKeyPoint[nextTime][loopAgent]]
        const agentPath = {} as PathType<PointType>
        agentPath.path = this.dfs(edge[0], edge[1])
        agentPath.period = nextTime - loopTime
        perTimePath.push(agentPath)
      }
      this.drivePath.push(perTimePath)
    }

    this.drivePath.push(
      this.driveKeyPoint[this.driveKeyPoint.length - 1].map((item) => {
        return {
          period: 1,
          path: [this.points[item], this.points[item]]
        } as PathType<PointType>
      })
    )
  }

  private dfs (beginIndex: number, endIndex: number) : Array<PointType> {
    let resultIndex : Array<number> = []
    const searchNode: Array<Array<number>> = []
    const openNode: Array<number> = []
    searchNode.push([beginIndex])
    while (searchNode.length) {
      const item = searchNode.shift() as Array<number>
      const lastItem = item[item.length - 1]
      const lastItemNeighbour = this.neighbour.h3ToGeo[this.neighbour.geoToH3[lastItem]] as Array<number>
      if (lastItemNeighbour.indexOf(endIndex) !== -1) {
        resultIndex = item
        break
      }
      const neiEdge = this.indexLines.filter((lines) => {
        return lastItemNeighbour.indexOf(lines[0]) !== -1 || lastItemNeighbour.indexOf(lines[1]) !== -1
      })
      const neiPoint = neiEdge.map((lines) => {
        if (lastItemNeighbour.indexOf(lines[0]) !== -1) return lines[1]
        else return lines[0]
      })
      const unsearchedPoint = neiPoint.filter((point) => {
        return openNode.indexOf(point) === -1
      })
      unsearchedPoint.forEach((point) => {
        openNode.push(point)
        searchNode.push(
          item.concat([point])
        )
      })
    }
    const result : Array<PointType> = resultIndex.map((indexPoint) => {
      return this.points[indexPoint]
    })
    return result
  }
}
