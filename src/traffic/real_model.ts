export interface PathType<PointType> {
  path: Array<PointType>
  period: number
}

export class RealModel<PointType> {
  private readonly lines: Array<Array<PointType>>
  private readonly indexLines: Array<Array<number>>
  private readonly points: Array<PointType>
  private readonly timeStep: number
  private readonly requests: Array<Array<PointType>>
  private readonly driveKeyPoint: Array<Array<number>>
  private readonly agentNumber: number
  private driveIndexPath: Array<Array<PathType<number>>> = []
  constructor (lines: Array<Array<number>>,
    points: Array<PointType>,
    requests: Array<Array<number>>,
    driveKeyPoint: Array<Array<number>>,
    driveIndexPath: Array<Array<PathType<number>>>) {
    this.indexLines = lines
    this.points = points
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
    this.driveIndexPath = driveIndexPath
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
    return this.driveIndexPath[timeStep].map((item) => {
      return {
        path: item.path.map((iitem) => {
          return this.points[iitem]
        }),
        period: item.period
      }
    })
  }

  public getRequests (timeStep: number) : Array<PointType> {
    return this.requests[timeStep]
  }

  public getTimeStep (): number {
    return this.timeStep
  }
}
