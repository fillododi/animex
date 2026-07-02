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
    private readonly MIN_CAM_DIST = 30;
    private readonly MAX_CAM_DIST = 35;
    private readonly ROT_DEAD_SPACE = 1/3;

    private readonly REACTION_DURATION = 2;
    private readonly HAPPY_JUMP_NUM = 3;
    private readonly HAPPY_JUMP_HEIGHT = 6;
    private readonly ANGRY_TURN_NUM = 3;
    private readonly ANGRY_TURN_AMP = 20 * Math.PI / 180;
    private readonly ROT_SPEED = this.ANGRY_TURN_AMP * this.ANGRY_TURN_NUM * 2 / this.REACTION_DURATION;
    private readonly EAT_THRESHOLD = 10; // how close to eat the food

    private readonly diet: FoodType;

    private state: State = State.IDLE;   
    private elapsed: number = 0; //Time passed since last state change
    private idleDur: number = 0;
    private initialYRot: number = 0; //Y rotation when the animal begins REACTION_BAD
    private angryRotDir: number = 1;
    private rotCushion: number = 0;

    constructor(name: string, scene: VRSceneManager, initialPosition: Vector3, gltf: GLTF, diet: FoodType) {            
        super(name, scene, initialPosition, gltf);
        this.diet = diet;
        this.setState(State.IDLE);
    }

	update(delta: number) {

        this.elapsed += delta;

        if (this.state & State.IDLE) {
            if (this.elapsed > this.idleDur)
            {
                const deg = (this.ROT_DEAD_SPACE + Math.random() * (2 - 2 * this.ROT_DEAD_SPACE)) * Math.PI;
                this.model.rotateY(deg);
                this.setState(State.MOVING)
            }
        }
        else if (this.state & State.MOVING) {
            this.model.translateOnAxis(new Vector3(0, 0, 1), this.MOVEMENT_SPEED * delta);

            const dist = this.model.position.distanceTo(new Vector3(0, 0, 0));
            if (dist < this.MIN_CAM_DIST || dist > this.MAX_CAM_DIST || this.elapsed > 3) {
                this.model.translateOnAxis(new Vector3(0, 0, 1), -2 * this.MOVEMENT_SPEED * delta); //Move back a bit
                this.setState(State.IDLE);
            }
                
        }
        else if (this.state & (State.REACTION_GOOD | State.REACTION_BAD)) {
            //Do reaction animation
            if (this.state & State.REACTION_GOOD) {
                this.model.position.y = this.HAPPY_JUMP_HEIGHT * Math.abs(Math.sin((Math.PI * this.elapsed * this.HAPPY_JUMP_NUM / this.REACTION_DURATION)))
            }
            else if (this.state & State.REACTION_BAD) {
                this.model.rotateY(delta * this.ROT_SPEED * this.angryRotDir);
                
                this.rotCushion -= delta;
                if (this.rotCushion < 0 && Math.abs(this.model.rotation.y - this.initialYRot) > this.ANGRY_TURN_AMP)
                {
                    this.angryRotDir *= -1; //Invert direction
                    this.rotCushion = 0.25; //Stop inversions for some time 
                }
            }
            
            if (this.elapsed > this.REACTION_DURATION)
                this.setState(State.IDLE);
        }

        if (this.state & (State.IDLE | State.MOVING)) {
            //Check for food
            const food = this.sceneMgr.getFoodEntities();
            if (food.size == 0)
                return;
            
            const pos = new Vector3();
            const fPos = new Vector3();
            this.model.getWorldPosition(pos);

            food.forEach((f) => {
                f.model.getWorldPosition(fPos);
                if (pos.distanceToSquared(fPos) < this.EAT_THRESHOLD ** 2) {
                    //Eat the food
                    this.model.lookAt(new Vector3(0, 0, 0)); //Look towards camera
                    this.sceneMgr.playSound('munch.m4a');
                    if ((f as FoodEntity).type & this.diet) {
                        this.sceneMgr.playSound('yummy.mp3');
                        this.setState(State.REACTION_GOOD);
                    }
                    else {
                        this.sceneMgr.playSound('belch.wav');
                        this.initialYRot = this.model.rotation.y;
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