import { Camera } from "@capacitor/camera"

export async function requestCameraPermission(): Promise<boolean> {
    const permissions = await Camera.requestPermissions()
    return permissions.camera === "granted"
}

export async function takePhoto() {
    return Camera.takePhoto({
        quality: 100,
    })
}