import { AnimalData } from './AnimalData'

export class RecognitionData {
    readonly recognizedAnimals: AnimalData[]

    constructor(rec: AnimalData[]) {
        this.recognizedAnimals = rec
    }
}