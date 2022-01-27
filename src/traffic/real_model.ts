export class RealModel<PointType> {
  private readonly lines: Array<Array<PointType>>
  private readonly points: Array<PointType>
  private readonly timeStep: number
  private readonly requests: Array<Array<PointType>>

  constructor (lines: Array<Array<PointType>>, points: Array<PointType>, requests: Array<Array<number>>) {
    this.lines = lines
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

    this.timeStep = requests.length
  }

  public getLines () : Array<Array<PointType>> {
    return this.lines
  }

  public getPoints () : Array<PointType> {
    return this.points
  }

  public getRequests (timeStep: number) : Array<PointType> {
    return this.requests[timeStep]
  }

  public getTimeStep (): number {
    return this.timeStep
  }
}
