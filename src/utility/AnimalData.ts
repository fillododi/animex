import { type AnimalType } from './AnimalType'
import { Position } from './Position'

export type AnimalData = {
    id: string
    animalType: AnimalType
    displayName: string
    pos: Position
}