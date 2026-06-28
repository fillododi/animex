import * as THREE from 'three';
import { AnimalType, FoodType } from "@/utility/AnimalType";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimalEntity } from './vr-entities/AnimalEntity';
import { FoodEntity } from './vr-entities/FoodEntity';
import { Entity } from './vr-entities/Entity';
import { assert } from '@/utility/assert';
import { Vector3 } from 'three';

/**
 * Manages the VR Scene.
 */
export class VRSceneManager {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;

    private readonly GLTFLoader: GLTFLoader;
    private readonly texLoader: THREE.TextureLoader;

    private readonly bgSphereMat: THREE.MeshBasicMaterial;

    /* Entity management */
    private readonly entities: Set<Entity>;
    private readonly clock: THREE.Clock;
    private frame: number = 0;


    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;

        this.scene = new THREE.Scene();
        // Set up scene elements
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 4, 2);
        this.scene.add(directionalLight);

        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
        this.bgSphereMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
        const bgSphere = new THREE.Mesh(sphereGeometry, this.bgSphereMat);
        this.scene.add(bgSphere);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
        this.scene.add(this.camera);

        this.GLTFLoader = new GLTFLoader();
        this.texLoader = new THREE.TextureLoader;

        this.entities = new Set();
        this.clock = new THREE.Clock();
    }

    /**
     * Loads the main scene of the VR: background and animal
     */
    loadMainScene() {
        // TODO: take animal from pinia
        const animal = AnimalType.DOG;

        // Load background
        this.texLoader.load(`/vr-assets/backgrounds/${animal.backgroundIMG}`, (tex: THREE.Texture) => {
            this.bgSphereMat.map = tex;
            this.bgSphereMat.needsUpdate = true;
        })

        // Load animal
        this.GLTFLoader.load(`/vr-assets/models/${animal.model}`, (gltf) => {
            const new_animal = new AnimalEntity("animal", this, new THREE.Vector3(0, 0, -20), gltf);
            this.addEntityToScene(new_animal);
        });
        
    }

    /**
     * Main engine loop for the VR. It will be called every frame.
     */
    engineLoop() {

        /* LOGIC */

        // Spawn food every second
        if (this.frame % 60 == 0)
            this.loadFood(new THREE.Vector3(Math.random() * 20 - 10, 20, Math.random() * 20 -40));


        /* UPDATES */

        // Update Entities
        const delta = this.clock.getDelta();
        for (const entity of this.entities)
            entity.update(delta);

        // Update Camera and renderer
        this.camera.updateMatrix();
        this.renderer.render(this.scene, this.camera);


        // Update Frame Count
        this.frame += 1;
    }

    /**
     * Loads food into the scene
     * @param position Where to spawn the food in the space
     */
    loadFood(position: Vector3) {
        // Load Food
        this.GLTFLoader.load(`/vr-assets/models/food_test.glb`, (gltf) => {
            const new_food = new FoodEntity("meat", this, position, gltf, FoodType.NONE);
            this.addEntityToScene(new_food);
        });
    
    }

    /**
     * Adds an entity to the scene
     * @param entity Entity to add
     * @throws Error if the entity (or its model) is invalid or corrupted
     */
    addEntityToScene(entity: Entity) {
        assert(entity != null && entity.model != null, "Error in adding entity to scene");
        this.entities.add(entity)
        this.scene.add(entity.model)
    }

    /**
     * Deletes an entity from the scene
     * @param entity entity to be deleted
     * @throws Error if the entity is not in the scene
     */
    deleteEntityFromScene(entity: Entity) {
        assert(this.entities.has(entity), "Error in deleting entity: trying to delete nonexistent entity")
        this.entities.delete(entity)
        this.scene.remove(entity.model);
    }

    /**
     * Returns an entity give a name
     * @param name Name of the desired entity
     * @returns the entity; null if there is no entity with the given name
     */
    findEntityByName(name: string): Entity | null {
        for (const entity of this.entities)
            if (entity.name === name)
                return entity
        return null
    }

    /**
     * Returns the entities of a desired type
     * @param type String of the name of the Class of entity desired (case sensitive)
     */
    getEntityByType(type: string) {
        const res: Set<Entity> = new Set();
        for (const entity of this.entities)
            if (entity.constructor.name === type)
                res.add(entity)
        return res;
    }

    /**
     * Activates the VR: this function loads the VR scene and starts the Engine Loop of the VR
     */
    activate() {
        // Load assets
        this.loadMainScene();

        // Start Engine
        this.renderer.setAnimationLoop(() => this.engineLoop())
    }

    /**
     * Deactivates the VR
     */
    deactivate() {
        this.renderer.setAnimationLoop(null);
        this.entities.forEach((ent: Entity) => {
            this.scene.remove(ent.model)
        });
        this.entities.clear()
    }

    /**
     * Helper function for resizing
     */
    onResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Returns the DOM
     * @returns The DOM
     */
    getRendererDOM() : HTMLCanvasElement {
        return this.renderer.domElement;
    }
}
