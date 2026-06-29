import type { FoodType } from "@/utility/AnimalType";
import { Entity } from "./Entity"
import type { VRSceneManager } from "../VRSceneMgr";
import { Vector3 } from "three";

import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { FoodEntity } from "./FoodEntity";

export class AnimalEntity extends Entity {

    private readonly EAT_THRESHOLD: number = 6; // how close to eat the food

    private readonly diet: FoodType;

    constructor(name: string, scene: VRSceneManager, initialPosition: Vector3, gltf: GLTF, diet: FoodType) {            
        super(name, scene, initialPosition, gltf);
        this.diet = diet;
    }

	update(delta: number) {
        const food = this.sceneMgr.getEntityByType("FoodEntity");
        if (food.size == 0)
            return;

        food.forEach((f) => {
            if (this.model.position.distanceTo(f.model.position) < this.EAT_THRESHOLD) {
                //Eat the food
                if ((f as FoodEntity).type & this.diet) {
                    console.log("I liked it!");
                }
                else {
                    console.log("Bleh!");
                }

                f.free();
            }
        })
    }

}