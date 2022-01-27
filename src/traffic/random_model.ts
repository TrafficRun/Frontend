interface RandomRequestPoint {
  pointIndex : number
  position: Array<number>
}

export class RandomTrafficRun {
  private readonly lines : Array<Array<Array<number>>>
  private readonly indexLines : Array<Array<number>> = []
  private readonly points : Array<Array<number>>
  private readonly timeStep : number
  private requests : Array<Array<RandomRequestPoint>> = []
  private drivePath : Array<Array<number>> = []
  constructor (lines : Array<Array<Array<number>>>, points : Array<Array<number>>, timeStep : number) {
    this.lines = lines
    this.points = points
    this.timeStep = timeStep
    this.generateRandomData()
    this.generateIndexLines()
    this.generateRandomService()
  }

  public getLines () : Array<Array<Array<number>>> {
    return this.lines
  }

  public getPoints () : Array<Array<number>> {
    return this.points
  }

  public getTimeStep () : number {
    return this.timeStep
  }

  private generateRandomData () {
    const perRequestNumber = Math.floor(this.points.length * 0.05)
    for (let loopTime = 0; loopTime < this.timeStep; ++loopTime) {
      const pointNumber = Math.ceil(Math.random() * perRequestNumber * 2)
      const randomPoints : Array<RandomRequestPoint> = []
      for (let loopPoint = 0; loopPoint < pointNumber; ++loopPoint) {
        const randomPoint = {
          pointIndex: Math.floor(Math.random() * this.points.length),
          position: []
        } as RandomRequestPoint
        randomPoint.position = this.points[randomPoint.pointIndex]
        randomPoint.position[0] = randomPoint.position[0] + Math.random() * 0.004 - 0.002
        randomPoint.position[1] = randomPoint.position[1] + Math.random() * 0.004 - 0.002
        randomPoints.push(randomPoint)
      }
      this.requests.push(randomPoints)
    }
  }

  private generateRandomService () {
    const driveNumber = Math.ceil(this.points.length * 0.01)
    const firstDrive : Array<number> = []
    for (let loopDrive = 0; loopDrive < driveNumber; ++loopDrive) {
      firstDrive.push(Math.floor(Math.random() * this.points.length))
    }
    this.drivePath.push(firstDrive)

    for (let loopTime = 1; loopTime < this.timeStep; ++loopTime) {
      const timeDrive : Array<number> = []
      const loopDriveNum : number = this.drivePath[loopTime - 1].length
      for (let loopDrive = 0; loopDrive < loopDriveNum; ++loopDrive) {
        const beginPoint = this.drivePath[loopTime - 1][loopDrive]
        let beginLines = this.indexLines.filter((lineItem : Array<number>) : boolean => {
          if (lineItem[0] === beginPoint) return true
          if (lineItem[1] === beginPoint) return true
          return false
        })
        if (beginLines.length === 0) continue
        beginLines = beginLines.map((lineItem) : Array<number> => {
          if (lineItem[0] === beginPoint) return lineItem
          else return [lineItem[1], lineItem[1]] as Array<number>
        })
        const choosePath = beginLines[Math.floor(Math.random() * beginLines.length)]
        timeDrive.push(choosePath[1])
      }
      this.drivePath.push(timeDrive)
    }
  }

  private generateIndexLines () {
    this.lines.forEach((pathItem : Array<Array<number>>) => {
      const indexPath : Array<number> = []
      pathItem.forEach((pointItem : Array<number>) => {
        indexPath.push(this.points.findIndex((value : Array<number>) => {
          return pointItem === value
        }))
      })
      this.indexLines.push(indexPath)
    })
  }

  public getRequest (nowTime : number) : Array<Array<number>> {
    return this.requests[nowTime].map((item : RandomRequestPoint) : Array<number> => {
      return item.position
    })
  }
}
