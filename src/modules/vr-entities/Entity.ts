import { Vector3, type Group, type Object3DEventMap } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRSceneManager } from "../VRSceneMgr";

export abstract class Entity {
    readonly id: number;
    readonly name:string;
    readonly model: Group<Object3DEventMap>;
    readonly sceneMgr: VRSceneManager;

	constructor(name: string, sceneMgr: VRSceneManager, initialPosition: Vector3, gltf: GLTF)  {
		this.name = name;
		this.id = Math.round(Math.random() * 100) + 1;
        this.sceneMgr = sceneMgr;

        this.model = gltf.scene;
        this.model.position.copy(initialPosition);
	}

    /**
     * Simulates one step in the animal's behavior.
     * @param delta Time since last step.
     */
	abstract update(delta: number): void

    /** 
     * Deletes this object from the parent scene and frees it.
     */
    free() {
        this.sceneMgr.deleteEntityFromScene(this);
    }
}