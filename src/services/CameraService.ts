import { Camera } from "@capacitor/camera"
import { Capacitor } from "@capacitor/core"

export async function requestCameraPermission(): Promise<boolean> {
    try {
        if(Capacitor.getPlatform() === "web") {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            stream.getTracks().forEach(track => track.stop())
            return true
        }
        //ios or android
        const check = await Camera.checkPermissions()
        if (check.camera === "granted") return true;
        const request = await Camera.requestPermissions({ permissions: ['camera'] })
        return request.camera === "granted"
    } catch {
        return false
    }
}

export async function takePhoto() {
    return Camera.takePhoto({
        quality: 100,
    })
}