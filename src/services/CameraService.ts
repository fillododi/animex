import { Camera } from "@capacitor/camera"

export async function requestCameraPermission(): Promise<boolean> {
    const check = await Camera.checkPermissions()
    if (check.camera === 'granted') return true

    const request = await Camera.requestPermissions({ permissions: ['camera'] })
    return request.camera === 'granted'
}

export async function takePhoto() {
    return Camera.takePhoto({
        quality: 100,
    })
}