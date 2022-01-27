import streets from '../data/street_manhattan.json'
import points from '../data/points.json'
import { RealModel } from './real_model'
import requests from '../data/request_some.json'

const formatStreets : Array<Array<Array<number>>> = []

for (let streetIndex = 0; streetIndex < streets.features.length; ++streetIndex) {
  const streetItem = streets.features[streetIndex]
  if (streetItem.geometry.type === 'MultiLineString') {
    for (let lineIndex = 0; lineIndex < streetItem.geometry.coordinates.length; ++lineIndex) {
      const lineItem = streetItem.geometry.coordinates[lineIndex] as Array<Array<number>>
      formatStreets.push(lineItem)
    }
  } else {
    const lineItem = streetItem.geometry.coordinates as Array<Array<number>>
    formatStreets.push(lineItem)
  }
}

export const ManhattanRun : RealModel<Array<number>> = new RealModel(formatStreets, points, requests)
