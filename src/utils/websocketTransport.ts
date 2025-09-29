import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatTransport, ChatMessage, PresenceEvent } from '../types/chat';
import { getAuthToken } from './authUtils';
import { API_BASE_URL } from './constants';

export class WebSocketTransport implements ChatTransport {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageCallback: ((msg: ChatMessage) => void) | null = null;
  private presenceCallback: ((evt: PresenceEvent) => void) | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1초

  constructor(private baseUrl: string = API_BASE_URL) {
    console.log('WebSocket Transport 초기화 - Base URL:', this.baseUrl);
  }

  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('=== WebSocket 연결 시작 ===');
        const token = await getAuthToken();
        console.log('WebSocket 인증 토큰:', token ? `${token.substring(0, 20)}...` : 'null');
        
        if (!token) {
          console.error('WebSocket 연결 실패: 토큰 없음');
          reject(new Error('로그인이 필요합니다. 토큰이 없습니다.'));
          return;
        }
        
        console.log('WebSocket URL:', `${this.baseUrl}/stomp`);
        const socket = new SockJS(`${this.baseUrl}/stomp`);
        
        // 연결 타임아웃 설정
        const connectionTimeout = setTimeout(() => {
          console.error('WebSocket 연결 타임아웃 (10초)');
          if (this.stompClient) {
            this.stompClient.deactivate();
          }
          reject(new Error('WebSocket 연결 타임아웃'));
        }, 10000);
        
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: { Authorization: `Bearer ${token}` },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          onConnect: () => {
            clearTimeout(connectionTimeout);
            console.log('WebSocket 연결 성공! 🌐✨');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            resolve();
          },
          onStompError: (frame) => {
            clearTimeout(connectionTimeout);
            console.error('STOMP 에러 프레임:', frame);
            console.error('STOMP 에러 헤더:', frame.headers);
            console.error('STOMP 에러 바디:', frame.body);
            this.isConnected = false;
            reject(new Error(`STOMP 연결 실패: ${frame.headers.message || frame.body || 'Unknown error'}`));
          },
          onWebSocketClose: (event) => {
            clearTimeout(connectionTimeout);
            console.log('WebSocket 연결 종료 - Code:', event?.code, 'Reason:', event?.reason);
            this.isConnected = false;
            // 초기 연결 시도 중이면 reject
            if (this.reconnectAttempts === 0) {
              reject(new Error(`WebSocket 연결 실패 - Code: ${event?.code}, Reason: ${event?.reason || 'Unknown'}`));
            } else {
              this.handleReconnect();
            }
          },
          onWebSocketError: (error) => {
            clearTimeout(connectionTimeout);
            console.error('WebSocket 에러:', error);
            this.isConnected = false;
            reject(new Error(`WebSocket 에러: ${error?.message || 'Unknown error'}`));
          }
        });

        console.log('STOMP 클라이언트 활성화 시작...');
        this.stompClient.activate();
      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      // 모든 구독 해제
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // 연결 종료
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
      
      console.log('WebSocket 연결 종료 완료 🔌');
    }
  }

  join(teamId: string): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다. 팀 참여 실패.');
      throw new Error('There is no underlying STOMP connection');
    }

    try {
      // 팀 참여
      this.stompClient.publish({
        destination: `/app/chat.join.${teamId}`,
        body: JSON.stringify({ teamId: parseInt(teamId) })
      });

      // 메시지 구독
      const messageSubscription = this.stompClient.subscribe(
        `/topic/team/${teamId}`,
        (message: IMessage) => {
          try {
            console.log('📨 메시지 수신:', message.body);
            const rawMessage = JSON.parse(message.body);
            
            // 백엔드 응답을 프론트엔드 ChatMessage 형식으로 변환
            const chatMessage: ChatMessage = {
              id: rawMessage.messageId || rawMessage.id || `msg_${Date.now()}_${Math.random()}`,
              teamId: String(rawMessage.teamId),
              senderId: String(rawMessage.senderId),
              senderName: rawMessage.senderName,
              text: rawMessage.messageText || rawMessage.text,
              createdAt: rawMessage.createdAt ? new Date(rawMessage.createdAt).getTime() : Date.now()
            };
            
            console.log('📨 변환된 메시지:', chatMessage);
            console.log('📨 메시지 콜백 존재 여부:', !!this.messageCallback);
            this.messageCallback?.(chatMessage);
            console.log('📨 메시지 콜백 호출 완료');
          } catch (error) {
            console.error('메시지 파싱 에러:', error);
          }
        }
      );

      // 참여/떠나기 이벤트 구독
      const presenceSubscription = this.stompClient.subscribe(
        `/topic/team/${teamId}/presence`,
        (message: IMessage) => {
          try {
            const presenceEvent: PresenceEvent = JSON.parse(message.body);
            this.presenceCallback?.(presenceEvent);
          } catch (error) {
            console.error('Presence 이벤트 파싱 에러:', error);
          }
        }
      );

      // 온라인 사용자 목록 구독
      const onlineSubscription = this.stompClient.subscribe(
        `/topic/team/${teamId}/online`,
        (message: IMessage) => {
          try {
            const onlineUsers: number[] = JSON.parse(message.body);
            console.log('온라인 사용자 목록:', onlineUsers);
          } catch (error) {
            console.error('온라인 사용자 목록 파싱 에러:', error);
          }
        }
      );

      // 구독 저장
      this.subscriptions.set(`messages_${teamId}`, messageSubscription);
      this.subscriptions.set(`presence_${teamId}`, presenceSubscription);
      this.subscriptions.set(`online_${teamId}`, onlineSubscription);

      console.log(`팀 ${teamId} 채팅방 참여 완료! 💬✨`);
    } catch (error) {
      console.error('팀 참여 실패:', error);
    }
  }

  leave(teamId: string): void {
    if (!this.stompClient || !this.isConnected) {
      return;
    }

    try {
      // 팀 떠나기
      this.stompClient.publish({
        destination: `/app/chat.leave.${teamId}`,
        body: JSON.stringify({ teamId: parseInt(teamId) })
      });

      // 구독 해제
      this.subscriptions.get(`messages_${teamId}`)?.unsubscribe();
      this.subscriptions.get(`presence_${teamId}`)?.unsubscribe();
      this.subscriptions.get(`online_${teamId}`)?.unsubscribe();

      this.subscriptions.delete(`messages_${teamId}`);
      this.subscriptions.delete(`presence_${teamId}`);
      this.subscriptions.delete(`online_${teamId}`);

      console.log(`팀 ${teamId} 채팅방 떠나기 완료! 👋`);
    } catch (error) {
      console.error('팀 떠나기 실패:', error);
    }
  }

  async send(teamId: string, text: string): Promise<void> {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    if (!text.trim()) {
      console.warn('빈 메시지는 전송할 수 없습니다.');
      return;
    }

    try {
      // JWT 토큰 가져오기
      const token = await getAuthToken();
      console.log('메시지 전송 시 토큰:', token ? `${token.substring(0, 20)}...` : 'null');

      const message = {
        teamId: parseInt(teamId),
        messageText: text.trim(),
        messageType: 'TEXT'
      };

      // 헤더에 JWT 토큰 포함
      const headers: { [key: string]: string } = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`📤 메시지 전송 시도: 팀 ${teamId}, 내용: ${text}`);
      console.log(`📤 메시지 데이터:`, message);
      console.log(`📤 헤더:`, headers);

      this.stompClient.publish({
        destination: `/app/chat.send.${teamId}`,
        body: JSON.stringify(message),
        headers: headers
      });

      console.log(`✅ 메시지 전송 완료: 팀 ${teamId}, 내용: ${text} 📤`);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  }

  onMessage(cb: (msg: ChatMessage) => void): () => void {
    this.messageCallback = cb;
    return () => {
      this.messageCallback = null;
    };
  }

  onPresence(cb: (evt: PresenceEvent) => void): () => void {
    this.presenceCallback = cb;
    return () => {
      this.presenceCallback = null;
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 지수 백오프

    console.log(`${delay}ms 후 재연결 시도... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch((error) => {
          console.error('재연결 실패:', error);
        });
      }
    }, delay);
  }

  // 연결 상태 확인
  getConnectionState(): boolean {
    return this.isConnected;
  }

  // 온라인 사용자 목록 요청
  requestOnlineUsers(teamId: string): void {
    if (!this.stompClient || !this.isConnected) {
      return;
    }

    this.stompClient.publish({
      destination: `/app/chat.online.${teamId}`,
      body: JSON.stringify({ teamId: parseInt(teamId) })
    });
  }

  // 메시지 삭제
  deleteMessage(teamId: string, messageId: string): void {
    if (!this.stompClient || !this.isConnected) {
      return;
    }

    this.stompClient.publish({
      destination: `/app/chat.delete.${teamId}`,
      body: messageId
    });
  }
}
