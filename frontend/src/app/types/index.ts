export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  // Image generation fields
  is_image_request?: boolean;
  image_prompt?: string;
  image_url?: string;
  image_data_url?: string;
  image_status?: 'pending' | 'generating' | 'success' | 'error';
  image_error?: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  conversation_id: number;
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  isGeneratingImage: boolean;
  conversationId: number | null;
  error: string | null;
}

// ========== Image Generation Types ==========

export interface ImageGenerateRequest {
  prompt: string;
  size?: string;
  steps?: number;
}

export interface ImageGenerateResponse {
  success: boolean;
  url?: string;
  data_url?: string;
  message: string;
  metadata?: {
    size: string;
    steps: number;
    model: string;
    original_prompt: string;
    enhanced_prompt: string;
  };
  error?: string;
}

export interface ImageServiceStatus {
  service: string;
  status: string;
  api_key_configured: boolean;
  model: string;
  free_tier: boolean;
  setup_url: string;
  message: string;
}
