import type { FoodType } from "@/utility/AnimalType";
import { Entity } from "./Entity"
import type { VRSceneManager } from "@/modules/VRSceneMgr";
import type { Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class FoodEntity extends Entity {

    private readonly SPEED = -4;

    readonly type: FoodType;

    constructor(name: string, scene: VRSceneManager, initialPosition: Vector3, gltf: GLTF, type: FoodType) {
        super(name, scene, initialPosition, gltf);
        this.type = type;
    }
    
	update(delta: number) {
        // Temp behavior for food

        this.model.position.y += this.SPEED * delta;

        // Delete food if it goes too down
        if (this.model.position.y <= -10) {
            this.free();
        }
    }
}