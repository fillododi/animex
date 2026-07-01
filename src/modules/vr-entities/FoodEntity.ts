import type { FoodType } from "@/utility/AnimalType";
import { Entity } from "./Entity"
import type { VRSceneManager } from "@/modules/VRSceneMgr";
import { Euler, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

enum State {
    FLIGHT,
    IDLE
}

export class FoodEntity extends Entity {

    private readonly ANGLE_DELTA_RAD = 20 * Math.PI / 180;
    private readonly FLIGHT_APEX = 8;
    private readonly FLIGHT_DURATION = 1;
    private readonly FLIGHT_LENGTH = 35;
    private readonly ROTATION_SPEED = 2;
    private readonly BOBBING_SPEED = 5;
    private readonly BOBBING_AMP = 0.5;

    private readonly flightDir: Vector3;

    private state: State;
    private elapsed: number = 0;
    readonly type: FoodType;


    constructor(name: string, sceneMgr: VRSceneManager, initialPosition: Vector3, gltf: GLTF, type: FoodType) {
        super(name, sceneMgr, initialPosition, gltf);
        this.type = type;

        //Gets a random direction in front of the camera
        const dir = sceneMgr.getCameraFacing();
        this.flightDir = dir.applyEuler(new Euler(0, (2 * Math.random() - 1) * this.ANGLE_DELTA_RAD, 0));

        this.state = State.FLIGHT;
    }
    
	update(delta: number) {
        this.elapsed += delta;

        if (this.state == State.FLIGHT) {
            this.model.position.y = Math.sin(Math.PI * this.elapsed / this.FLIGHT_DURATION) * this.FLIGHT_APEX;
            this.model.translateOnAxis(this.flightDir, this.FLIGHT_LENGTH * delta / this.FLIGHT_DURATION);

            if (this.elapsed > this.FLIGHT_DURATION) {
                this.sceneMgr.addToDragControls(this.model);
                this.state = State.IDLE;
            }
        }
        else if (this.state == State.IDLE) {
            this.model.position.y = Math.sin(this.elapsed * this.BOBBING_SPEED) * this.BOBBING_AMP;
            this.model.rotateY(delta * this.ROTATION_SPEED);
        }

        // Delete food after a few seconds
        if (this.elapsed > 10)
            this.free();
    }

    free() {
        super.free();
        if (this.state == State.IDLE)
            this.sceneMgr.removeFromDragControls(this.model);
    }
}