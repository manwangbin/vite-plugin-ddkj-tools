export default interface AiMessage {

    sessionId?: string;

    taskId: string;

    msg: string;

    type: "reason" | "content";

    finished: boolean;
}