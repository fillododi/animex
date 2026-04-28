import { CameraPreview, type CameraPreviewOptions } from "@capacitor-community/camera-preview";

export async function start() {
    var options: CameraPreviewOptions = {
        position: 'front',
        parent: 'camera',
        toBack: true, // overlay ui
    };
    await CameraPreview.start(options);
}

export async function stop() {
    await CameraPreview.stop();
}

export async function takePhoto(): Promise<{value: String}> {
    var res = await CameraPreview.captureSample({quality: 100});
    return res;
}