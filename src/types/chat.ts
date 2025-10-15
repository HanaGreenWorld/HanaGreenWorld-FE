export type Team = {
  id: string;
  name: string;
  members?: number;
};

export type ChatMessage = {
  id: string;
  teamId: string;
  senderId: string;
  senderName?: string;
  text: string;
  messageType?: string; // TEXT, IMAGE, FILE, SYSTEM
  createdAt: number; // epoch ms
};

export type PresenceEvent = {
  teamId: string;
  userId: string;
  action: 'join' | 'leave';
  at: number;
};

export interface ChatTransport {
  connect(): Promise<void>;
  disconnect(): void;
  join(teamId: string): void;
  leave(teamId: string): void;
  send(teamId: string, text: string): Promise<void>;
  onMessage(cb: (msg: ChatMessage) => void): () => void;
  onPresence(cb: (evt: PresenceEvent) => void): () => void;
}


