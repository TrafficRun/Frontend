import { fabric } from 'fabric'

export class GridDraw {
  private canvas : fabric.Canvas
  private height : number = 0
  private width : number = 0
  public constructor(dom: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(dom)
  }
  
  public setEnv(height: number, width: number) {
    this.height = height
    this.width = width
    this.draw()
  }

  private draw() {
    this.canvas.clear()
    for (let loopHeight = 0; loopHeight < this.height; ++loopHeight) {
      for (let loopWidth = 0; loopWidth < this.width; ++loopWidth) {
        let node = new fabric.Circle({
          left: 50 + 50 * loopWidth,
          top: 50 + 50 * loopHeight,
          fill: 'blue',
          height: 10,
          width: 10
        })
        this.canvas.add(node)
      }
    }
  }
}