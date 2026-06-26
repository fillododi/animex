import * as THREE from 'three';
import { VREntityManager } from "@/modules/vr-entities/VREntityMgr";
import type { AnimalType } from "@/utility/AnimalType";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimalEntity } from './vr-entities/AnimalEntity';

/**
 * Manages the VR Scene.
 */
export class VRSceneManager {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly entityManager: VREntityManager;

    private readonly GLTFLoader: GLTFLoader;
    private readonly texLoader: THREE.TextureLoader;

    private readonly bgSphereMat: THREE.MeshBasicMaterial;

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

        this.entityManager = new VREntityManager();
        
        this.GLTFLoader = new GLTFLoader();
        this.texLoader = new THREE.TextureLoader;
    }

    getRendererDOM() : HTMLCanvasElement {
        return this.renderer.domElement
    }

    /**
     * Loads the scene with the animal's vr assets
     * @param animal The animal to render.
     */
    loadAnimalScene(animal: AnimalType) {
        this.texLoader.load(`/vr-assets/backgrounds/${animal.backgroundIMG}`, (tex: THREE.Texture) => {
            this.bgSphereMat.map = tex;
            this.bgSphereMat.needsUpdate = true;
        })

        this.GLTFLoader.load(`/vr-assets/models/${animal.model}`, (gltf) => {
            this.entityManager.addEntity(new AnimalEntity("animal", this.scene, new THREE.Vector3(0, 0, -2), gltf));
        });

        this.renderer.setAnimationLoop(() => {
            this.entityManager.update();
            this.camera.updateMatrix();
            //TODO: add controls
            this.renderer.render(this.scene, this.camera);
        })
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    deactivate() {
        this.renderer.setAnimationLoop(null);
        this.clearScene();
    }

    clearScene() {
        this.entityManager.getAllEntities().forEach(ent => {
            this.entityManager.removeEntity(ent);
            this.scene.remove(ent.model);
        });
    }
}
