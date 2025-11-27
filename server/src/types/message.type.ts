export interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_time: Date;
}

export interface Conversation {
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  latest_message: string;
  latest_time: Date;
  sender_avatar?: string;
  sender_name?: string;
  receiver_avatar?: string;
  receiver_name?: string;
}

export interface MessageResponse {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_time: Date;
}

export interface ConversationResponse {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  latest_message: string;
  latest_time: Date;
}
