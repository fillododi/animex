import { type Service } from "./Service";
import { assert } from "@/utility/assert";

export interface CameraService extends Service {
  /**
   * Takes a frame from the current camera view.
   *
   * @returns A promise containing the frame's data as a base64 String.
   * @throws An Error if the service isn't active.
   */
  getCameraFrame(): Promise<{ value: string }>;
}

export class DeviceCameraService implements CameraService {
  private videoElement: HTMLVideoElement;
  private stream: MediaStream | undefined;
  private active: boolean;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.stream = undefined;
    this.active = false;
  }

  async start() {
    assert(!this.active, "Camera Service already active!");

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
      },
      audio: false,
    });

    this.videoElement.srcObject = this.stream;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    this.videoElement.autoplay = true;

    await this.videoElement.play();

    this.active = true;
  }

  async stop() {
    assert(this.active, "Camera Service already stopped!");

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;

    this.videoElement.pause();
    this.videoElement.srcObject = null;

    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  async getCameraFrame(): Promise<{ value: string }> {
    assert(this.active, "Can't capture a frame from an inactive camera!");

    const width = this.videoElement.videoWidth;
    const height = this.videoElement.videoHeight;

    assert(width > 0 && height > 0, "Camera video is not ready yet!");

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    assert(ctx !== null, "Could not create canvas context!");

    ctx.drawImage(this.videoElement, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

    /**
     * dataUrl format:
     * data:image/jpeg;base64,/9j/4AAQSk...
     *
     * CameraPreview.captureSample returned only the base64 string,
     * so we strip the prefix to keep the same API shape.
     */
    const base64 = dataUrl.split(",")[1];

    return { value: base64?? "" };
  }
}