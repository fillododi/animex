import * as THREE from 'three';
import { FoodType } from "@/utility/AnimalType";
import { DragControls } from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimalEntity } from './vr-entities/AnimalEntity';
import { FoodEntity } from './vr-entities/FoodEntity';
import { Entity } from './vr-entities/Entity';
import { assert } from '@/utility/assert';
import { Vector3 } from 'three';
import { useSessionStore } from '@/stores/sessionStore';

/**
 * Manages the VR Scene.
 */
export class VRSceneManager {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    
    private readonly GLTFLoader: GLTFLoader;
    private readonly texLoader: THREE.TextureLoader;

    private readonly audioLoader: THREE.AudioLoader;
    private readonly audioListener: THREE.AudioListener;

    private readonly bgSphereMat: THREE.MeshBasicMaterial;

    /* Entity management */
    private readonly entities: Set<Entity>;
    private readonly clock: THREE.Clock;
    private cameraRotation: Vector3 = new Vector3(0, 0, 0);
    private frame: number = 0;

    private readonly foodModels: Map<FoodType, string[]>;
    
    private readonly dragCont: DragControls;

    /* Temp variables to rotate more efficiently */
    private euler: THREE.Euler = new THREE.Euler();
    private readonly quat: THREE.Quaternion = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

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

        const sphereGeometry = new THREE.SphereGeometry(100, 64, 64);
        this.bgSphereMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
        const bgSphere = new THREE.Mesh(sphereGeometry, this.bgSphereMat);
        this.scene.add(bgSphere);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 150);
        this.camera.position.set(0, 10, 0);
        this.scene.add(this.camera);

        this.dragCont = new DragControls([], this.camera, this.renderer.domElement);
        this.dragCont.transformGroup = true;

        this.GLTFLoader = new GLTFLoader();
        this.texLoader = new THREE.TextureLoader;

        this.audioLoader = new THREE.AudioLoader();
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);

        this.entities = new Set();
        this.clock = new THREE.Clock();

        this.foodModels = new Map<FoodType, string[]>()
        this.foodModels.set(FoodType.MEAT, ['steak.glb', 'turkey.glb']);
        this.foodModels.set(FoodType.PLANT, ['plant.glb', 'salad-bowl.glb']);
    }

    /**
     * Loads the main scene of the VR: background and animal
     */
    loadMainScene() {
        const animal = useSessionStore().getAnimalType();
        if(!animal) return;
        // Load background
        this.texLoader.load(`/vr-assets/backgrounds/${animal.backgroundIMG}`, (tex: THREE.Texture) => {
            this.bgSphereMat.map = tex;
            this.bgSphereMat.needsUpdate = true;
        })

        // Load animal
        this.GLTFLoader.load(`/vr-assets/models/${animal.model}`, (gltf) => {
            const new_animal = new AnimalEntity("animal", this, new THREE.Vector3(0, 0, -30), gltf, animal.diet);
            this.addEntityToScene(new_animal);
        });

        this.clock.start();
    }

    /**
     * Main engine loop for the VR. It will be called every frame.
     */
    engineLoop() {
        // Update Entities
        const delta = this.clock.getDelta();
        for (const entity of this.entities)
            entity.update(delta);

        this.dragCont.update(delta);

        // Update Camera and renderer
        this.euler.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z, 'YXZ');
        this.camera.quaternion.setFromEuler(this.euler);
        this.camera.quaternion.multiply(this.quat);
        this.camera.updateMatrix();

        this.renderer.render(this.scene, this.camera);

        // Update Frame Count
        this.frame += 1;
    }

    /**
     * Rotates the camera to the given rotation
     * @param rotation Rotation to which rotate the camera
     */
    updateCameraRotation(rotation: Vector3) {
        this.cameraRotation = rotation;
    }

    /**
     * Loads food of a specified type into the scene.
     * @param type The type of food to spawn.
     */
    spawnFoodOfType(type: FoodType) {
        const models = this.foodModels.get(type);
        if (!models) return;

        const model = models.at(Math.floor(Math.random() * models.length));
        if (!model) return;

        this.GLTFLoader.load(`/vr-assets/models/${model}`, (gltf) => {
            const new_food = new FoodEntity("meat", this, new THREE.Vector3(0, 0, 0), gltf, type);
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
     * @returns All the FoodEntities currently in the scene.
     */
    getFoodEntities(): Set<FoodEntity> {
        const res: Set<FoodEntity> = new Set();
        this.entities.forEach((ent) => {
            if (ent instanceof FoodEntity)
                res.add(ent as FoodEntity);
        })
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

        const temp = new Set(this.entities);
        temp.forEach((ent: Entity) => {
            this.deleteEntityFromScene(ent);
        });
        this.entities.clear()

        this.clock.stop();
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

    /**
     * Returns the direction the camera is facing along the XZ plane.
     */
    getCameraFacing(): THREE.Vector3 {
        const res = new THREE.Vector3();
        this.camera.getWorldDirection(res);
        res.y = 0;
        return res.normalize();
    }

    /**
     * Adds an object to the drag controls.
     * @param obj The object to add.
     * @throws Error if the object is already in the drag controls.
     */
    addToDragControls(obj: THREE.Object3D) {
        assert(!this.dragCont.objects.includes(obj), "Object already under drag controls!");

        this.dragCont.objects.push(obj);
    }

    /**
     * Removes an object from the drag controls.
     * @param obj The obj to remove.
     * @throws Error if the object isn't in the drag controls.
     */
    removeFromDragControls(obj: THREE.Object3D) {
        assert(this.dragCont.objects.includes(obj), "Object not under drag controls!");

        this.dragCont.objects.splice(this.dragCont.objects.indexOf(obj), 1);
    }

    /**
     * Plays a sound.
     * @param soundFile The filename of the sound to play.
     */
    playSound(soundFile: string) {
        const sound = new THREE.Audio(this.audioListener);
        this.audioLoader.load( `/vr-assets/sounds/${soundFile}`, (buffer) => {
            sound.setBuffer(buffer);
            sound.setVolume(1);
            sound.play();
        });
    }
}
