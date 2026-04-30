import type { RecognitionData } from "@/utility/RecognitionData"
import type { Service } from "./Service"

export interface ConnectionService extends Service {
    /**
     * Sends an image to the server and receives the recognized animals in it.
     * @param visionFrame The data of the image as a string
     * @returns The server's response
     */
    sendRecognitionRequest(visionFrame: String): Promise<RecognitionData>
    //sendChatRequest
    //sendARRequest
}