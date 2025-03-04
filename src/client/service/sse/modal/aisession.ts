import AiMessage from "./aimessage";

export interface AiSession {
    title: string;
    sessionId: string;
    msg: Array<AiMessage>;
}