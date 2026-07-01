import type { FoodType } from "@/utility/AnimalType";
import { Entity } from "./Entity"
import type { VRSceneManager } from "../VRSceneMgr";
import { Vector3 } from "three";

import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { FoodEntity } from "./FoodEntity";

enum State {
    IDLE = 1,
    MOVING = 2,
    REACTION_GOOD = 4,
    REACTION_BAD = 8,
}

export class AnimalEntity extends Entity {

    private readonly IDLE_DUR_MIN = 2;
    private readonly IDLE_DUR_DELTA = 1.5;
    private readonly MOVEMENT_SPEED = 3;
    private readonly REACTION_DURATION = 2;
    private readonly HAPPY_JUMP_NUM = 3;
    private readonly HAPPY_JUMP_HEIGHT = 6;

    private readonly EAT_THRESHOLD = 6; // how close to eat the food

    private readonly diet: FoodType;

    private state: State = State.IDLE;   
    private elapsed: number = 0; //Time passed since last state change
    private idleDur: number = 0;

    constructor(name: string, scene: VRSceneManager, initialPosition: Vector3, gltf: GLTF, diet: FoodType) {            
        super(name, scene, initialPosition, gltf);
        this.diet = diet;
        this.setState(State.IDLE);
    }

	update(delta: number) {

        this.elapsed += delta;

        if (this.state == State.IDLE) {
            
        }

        if (this.state == (State.REACTION_GOOD | State.REACTION_BAD)) {
            
            if (this.elapsed > this.REACTION_DURATION)
                this.setState(State.IDLE);
        }

        if (this.state & (State.IDLE | State.MOVING)) {
            //Check for food
            const food = this.sceneMgr.getEntityByType("FoodEntity");
            if (food.size == 0)
                return;

            
            food.forEach((f) => {
                if (this.model.position.distanceTo(f.model.position) < this.EAT_THRESHOLD) {
                    //Eat the food
                    this.sceneMgr.playSound('munch.m4a');
                    if ((f as FoodEntity).type & this.diet) {
                        this.sceneMgr.playSound('yummy.mp3');
                        this.setState(State.REACTION_GOOD);
                    }
                    else {
                        this.sceneMgr.playSound('belch.wav');
                        this.setState(State.REACTION_BAD);
                    }

                    f.free();
                }
            })
        }
    }

    private setState(newState: State) {
        this.state = newState;
        this.elapsed = 0;

        if (newState == State.IDLE)
            this.idleDur = this.IDLE_DUR_MIN + Math.random() * this.IDLE_DUR_DELTA;
    }
}