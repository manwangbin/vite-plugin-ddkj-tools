export default interface AiMessage {

    taskId?: string;

    reason?: string;

    content: string;

    role: "user" | "assistant" | "system";

    finished: boolean;
}