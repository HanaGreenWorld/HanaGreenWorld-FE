import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatTransport } from '../types/chat';

export function useChat(transport: ChatTransport | null, teamId: string | null, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const unsubMsgRef = useRef<null | (() => void)>(null);
  const unsubPresenceRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (!transport) return;
    
    const connectTransport = async () => {
      try {
        await transport.connect();
        console.log('useChat: WebSocket 연결 성공');
      } catch (error) {
        console.error('useChat: WebSocket 연결 실패:', error);
      }
    };
    
    connectTransport();
    return () => {
      try {
        transport.disconnect();
      } catch (error) {
        console.error('useChat: WebSocket 연결 해제 실패:', error);
      }
    };
  }, [transport]);

  useEffect(() => {
    if (!transport) return;
    // unsubscribe old
    unsubMsgRef.current?.();
    unsubPresenceRef.current?.();

    if (!teamId) return;
    
    try {
      transport.join(teamId);
      unsubMsgRef.current = transport.onMessage((msg) => {
      console.log('🎯 useChat 메시지 수신:', msg);
      console.log('🎯 메시지 teamId:', msg.teamId, '타입:', typeof msg.teamId);
      console.log('🎯 현재 teamId:', teamId, '타입:', typeof teamId);
      
      // teamId 타입 변환하여 비교
      const msgTeamId = String(msg.teamId);
      const currentTeamId = String(teamId);
      
      if (msgTeamId === currentTeamId) {
        console.log('🎯 메시지 추가:', msg);
        setMessages((prev) => {
          const newMessages = [...prev, msg];
          console.log('🎯 새로운 메시지 목록:', newMessages);
          return newMessages;
        });
      } else {
        console.log('🎯 teamId 불일치로 메시지 무시 - 변환 후:', msgTeamId, 'vs', currentTeamId);
      }
      });
      unsubPresenceRef.current = transport.onPresence(() => {});
    } catch (error) {
      console.error('useChat: 팀 채팅 참여 실패:', error);
    }

    return () => {
      try {
        transport.leave(teamId);
        unsubMsgRef.current?.();
        unsubPresenceRef.current?.();
      } catch (error) {
        console.error('useChat: 팀 채팅 나가기 실패:', error);
      }
    };
  }, [transport, teamId]);

  const send = (text: string) => {
    console.log('🎯 useChat send 호출:', { transport: !!transport, teamId, text });
    if (!transport || !teamId || !text.trim()) {
      console.log('🎯 send 조건 실패:', { transport: !!transport, teamId, text: text.trim() });
      return;
    }
    
    try {
      console.log('🎯 transport.send 호출:', teamId, text);
      transport.send(teamId, text, userId);
    } catch (error) {
      console.error('useChat: 메시지 전송 실패:', error);
    }
  };

  return { messages, send };
}


