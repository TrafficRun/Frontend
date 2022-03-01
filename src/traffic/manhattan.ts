// import streets from '../data/street_manhattan.json'
// import points from '../data/points.json'
import { RealModel, PathType } from './real_model'
// import requests from '../data/point_v3.json'
// import driveKeyPoint from '../data/drive_v3.json'
// import drivePath from '../data/drive_path_v5.json'

// const formatStreets : Array<Array<number>> = []

// for (let streetIndex = 0; streetIndex < streets.features.length; ++streetIndex) {
//   const streetItem = streets.features[streetIndex]
//   if (streetItem.geometry.type === 'MultiLineString') {
//     for (let lineIndex = 0; lineIndex < streetItem.geometry.coordinates.length; ++lineIndex) {
//       const lineItem = streetItem.geometry.coordinates[lineIndex] as Array<Array<number>>
//       const indexLineItem = lineItem.map((item) => {
//         return points.findIndex((titem) => {
//           if (titem[0] === item[0] && titem[1] === item[1]) {
//             return true
//           }
//           return false
//         })
//       })
//       formatStreets.push(indexLineItem)
//     }
//   } else {
//     const lineItem = streetItem.geometry.coordinates as Array<Array<number>>
//     const indexLineItem = lineItem.map((item) => {
//       return points.findIndex((titem) => {
//         if (titem[0] === item[0] && titem[1] === item[1]) {
//           return true
//         }
//         return false
//       })
//     })
//     formatStreets.push(indexLineItem)
//   }
// }
const fakeformatStreets : Array<Array<number>> = []
const fakePoints : Array<Array<number>> = []
const fakeRequests : Array<Array<number>> = []
const fakeDriveKeyPoint : Array<Array<number>> = [[]]
const fakeDrivePath : Array<Array<PathType<number>>> = []

// export const ManhattanRun : RealModel<Array<number>> = new RealModel(formatStreets, points, requests, driveKeyPoint, drivePath)
export const ManhattanRun : RealModel<Array<number>> = new RealModel(fakeformatStreets, fakePoints, fakeRequests, fakeDriveKeyPoint, fakeDrivePath)
