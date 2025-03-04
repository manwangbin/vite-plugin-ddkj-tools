export interface MsgContent {
  type: 'TEXT' | 'IMG' | 'SOUND' | 'VIDEO' | 'MARKDOWN';
  content: string;
}

export interface AiMsg {
  id: string;
  user?: AiUser;
  time: string;
  data: Array<MsgContent>;
}
