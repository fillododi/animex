import { useServiceStore } from "@/stores/serviceStore";
import { useSessionStore } from "@/stores/sessionStore";
import type { AnimalData } from "@/utility/AnimalData";
import type { AnimalType } from "@/utility/AnimalType";

export class RecognitionManager {
  private frameId: number;
  private interval: ReturnType<typeof setInterval> | undefined;
  private isProcessingFrame: boolean;

  constructor() {
    this.frameId = 0;
    this.interval = undefined;
    this.isProcessingFrame = false;
  }

  /**
   * Initiates a new recognition loop with a new session ID,
   * starts the camera and connection services if necessary.
   */
  async startRecognitionLoop() {
    const serviceStore = useServiceStore();

    const cameraService = serviceStore.cameraService;
    if (!(cameraService && cameraService.isActive())) {
      await cameraService?.start();
    }

    const connectionService = serviceStore.connectionService;
    if (!(connectionService && connectionService.isActive())) {
      await connectionService?.start();
    }

    const sessionStore = useSessionStore();
    sessionStore.clearSession();

    this.frameId = 0;
    this.isProcessingFrame = false;

    clearInterval(this.interval);

    const intervalMs = Number(import.meta.env.VITE_RECOGNITION_TIMER_MS);

    this.interval = setInterval(() => {
      void this.snapshotLoop();
    }, intervalMs);
  }

  /**
   * Stops the ongoing recognition loop, stops the camera service if necessary.
   *
   * @remark Does NOT stop the connection service.
   */
  async stopRecognitionLoop() {
    const cameraService = useServiceStore().cameraService;

    clearInterval(this.interval);
    this.interval = undefined;
    this.isProcessingFrame = false;

    if (cameraService && cameraService.isActive()) {
      await cameraService.stop();
    }
  }

  private async snapshotLoop() {
    if (this.isProcessingFrame) {
      return;
    }

    this.isProcessingFrame = true;

    try {
      const serviceStore = useServiceStore();
      const cameraService = serviceStore.cameraService;
      const connectionService = serviceStore.connectionService;
      const sessionStore = useSessionStore();

      if (!cameraService?.isActive() || !connectionService?.isActive()) {
        await this.stopRecognitionLoop();
        return;
      }

      const frame = await cameraService.getCameraFrame();

      const response = await connectionService.sendRecognitionRequest(
        sessionStore.sessionId,
        this.frameId,
        frame.value
      );

      const vertices =
        response?.selectedAnimal.boundingPoly?.normalizedVertices ?? [];

      const sumX = vertices.reduce((sum, vert) => sum + vert.x, 0);
      const sumY = vertices.reduce((sum, vert) => sum + vert.y, 0);
      const numVerts = vertices.length || 1;

      const animalData: AnimalData = {
        id: crypto.randomUUID(),
        animalType: (response?.selectedAnimal.id ?? "unknown") as AnimalType,
        pos: {
          x: sumX / numVerts,
          y: sumY / numVerts,
        },
      };

      sessionStore.updateRecognizedAnimal(animalData);
      this.frameId++;
    } finally {
      this.isProcessingFrame = false;
    }
  }
}