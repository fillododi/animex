import { Timer } from "three";
import type { AnimalEntity } from "./AnimalEntity";

/**
 * Stores all animal entities in the scene and handles their update behavior.
 */
export class VREntityManager {

    private readonly entities: AnimalEntity[];
    private readonly clock: Timer;

    constructor() {
        this.entities = [];
        this.clock = new Timer();
    }

    addEntity(ent: AnimalEntity) {
        this.entities.push(ent);
    }

    removeEntity(ent: AnimalEntity) {
        this.entities.filter((current) => {
            return current.id !== ent.id;
        });
    }

    findByName(name: string): AnimalEntity | undefined {
        return this.entities.find((ent) => {
            return ent.name === name;
        });
    }

    getAllEntities(): AnimalEntity[] {
        return this.entities;
    }

    update() {
        this.clock.update();
        this.entities.forEach(entity => entity.update(this.clock.getDelta(), this.clock.getElapsed()));
    }
}