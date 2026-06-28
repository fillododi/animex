import { Entity } from "./Entity"
import { assert } from "@/utility/assert";

export class AnimalEntity extends Entity {

    private readonly SPEED = 5;
    private readonly THRESHOLD = 0.4;

	update(delta: number) {
        // Temp behavior for animal to see if it works

        // Move towards closest valid food
        const food = this.sceneMgr.getEntityByType("FoodEntity");
        if (food.size == 0)
            return;
        let closest_food = null;
        let closest_distance = Infinity;
        
        for (const f of food) {
            const distance = this.model.position.distanceToSquared(f.model.position);
            if (distance < closest_distance && f.model.position.y > 0) {
                closest_distance = distance;
                closest_food = f;
            }
        }
        assert(closest_food != null, "Error in food distance computation")

        if (this.model.position.x < closest_food.model.position.x - this.THRESHOLD) {
            this.model.position.x += this.SPEED * delta;
        } else if (this.model.position.x > closest_food.model.position.x + this.THRESHOLD) {
            this.model.position.x -= this.SPEED * delta;
        } else {
            this.model.position.x += 0;
        }
    }

}