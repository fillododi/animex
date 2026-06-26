import type { Group, Object3DEventMap, Scene, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class AnimalEntity {
    readonly name:string;
    readonly id: number;
    readonly model: Group<Object3DEventMap>;

	constructor(name: string, scene: Scene, initialPosition: Vector3, gltf: GLTF)  {
		this.name = name;
		this.id = Math.round(Math.random() * 100) + 1;

        this.model = gltf.scene;
        scene.add(this.model);
        this.model.position.copy(initialPosition);
	}

    /**
     * Simulates one step in the animal's behavior.
     * @param delta Time since last step.
     * @param elapsed Time since simulation began.
     */
	update(delta: number, elapsed: number) {
        //Temp behavior
        this.model.position.x = (elapsed % 2) - 1;
    }

	dispose() {}
}