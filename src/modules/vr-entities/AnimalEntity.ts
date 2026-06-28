import { Vector3 } from "three";
import { Entity } from "./Entity"
import { assert } from "@/utility/assert";

export class AnimalEntity extends Entity {

    private readonly SPEED: number = 10;
    private readonly MOVEMENT_THRESHOLD: number = 0.4; // stops the animal if it is already on the food
    private readonly EAT_THRESHOLD: number = 1; // how close to eat the food

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

        let x_mov: number = 0;
        let z_mov: number = 0;
        if (this.model.position.x < closest_food.model.position.x - this.MOVEMENT_THRESHOLD) {
            x_mov = 1;
        } else if (this.model.position.x > closest_food.model.position.x + this.MOVEMENT_THRESHOLD) {
            x_mov = -1;
        }
        if (this.model.position.z < closest_food.model.position.z - this.MOVEMENT_THRESHOLD) {
            z_mov = 1;
        } else if (this.model.position.z > closest_food.model.position.z + this.MOVEMENT_THRESHOLD) {
            z_mov = -1;
        }

        this.model.position.add(new Vector3(this.SPEED * delta * x_mov, 0, this.SPEED * delta * z_mov))
        this.model.lookAt(new Vector3(closest_food.model.position.x, 0, closest_food.model.position.z));

        /* Eat */
        if (closest_food.model.position.distanceToSquared(this.model.position) < this.EAT_THRESHOLD) {
            closest_food.free();
        }
    }

}