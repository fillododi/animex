import { AnimalType } from './AnimalType'
import { Position } from './Position'

export class AnimalData {
    readonly id: number
    readonly animalType: AnimalType
    readonly pos: Position

    constructor(id: number, type: AnimalType, pos: Position) {
        this.id = id
        this.animalType = type
        this.pos = pos
    }
}