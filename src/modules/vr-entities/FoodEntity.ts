import { Entity } from "./Entity"

export class FoodEntity extends Entity {

    private readonly SPEED = -4;

	update(delta: number) {
        // Temp behavior for food

        this.model.position.y += this.SPEED * delta;

        // Delete food if it goes too down
        if (this.model.position.y <= -10) {
            this.free();
        }
    }
}