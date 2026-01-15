import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ChatAPI {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sparkie_token', token);
    }
  }

  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('sparkie_token');
    }
    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sparkie_token');
    }
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }

    return response.data;
  }

  async register(username: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', {
      username, email, password,
    });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout() {
    this.clearToken();
  }

  async sendMessage(message: string, conversationId?: number, stream: boolean = true) {
    const response = await this.client.post('/chat', {
      message, conversation_id: conversationId, stream,
    });
    return response.data;
  }

  async *streamMessage(message: string, conversationId?: number): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ message, conversation_id: conversationId, stream: true }),
    });

    if (!response.ok) {
      throw new Error('Streaming failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data.chunk;
            if (data.done) return;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async getConversations(limit: number = 50, offset: number = 0) {
    const response = await this.client.get('/chat/conversations', {
      params: { limit, offset },
    });
    return response.data;
  }

  // ========== Image Generation ==========

  /**
   * Detect if a message contains an image generation request.
   * @param text - User input text
   * @returns Extracted prompt if image request detected, null otherwise
   */
  detectImageRequest(text: string): string | null {
    const patterns = [
      /generate\s+(an?\s+)?image\s+(of\s+|with\s+)?/i,
      /draw\s+(me\s+)?/i,
      /show\s+(me\s+)?/i,
      /create\s+(an?\s+)?(image|picture|photo)/i,
      /visualize\s+/i,
      /what\s+does\s+(sparkie|queen bee)\s+(look|look\s+like)/i,
      /show\s+(me\s+)?(sparkie|queen bee)/i,
      /draw\s+(sparkie|queen bee)/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        // Extract the prompt
        let prompt = text.replace(pattern, '').trim();
        prompt = prompt.replace(/^(of|with|the|a|an)\s+/i, '').trim();
        prompt = prompt.replace(/^[.,!?;:]\s*/, '');
        
        // Add bee context if not present
        const beeKeywords = ['bee', 'queen', 'sparkie', 'hive', 'honey', 'polleneer'];
        if (!beeKeywords.some(kw => prompt.toLowerCase().includes(kw))) {
          prompt = `${prompt}, queen bee style with golden honey glow`;
        }
        
        return prompt;
      }
    }
    return null;
  }

  /**
   * Generate an image using ModelScope API.
   * @param prompt - Text description of the image
   * @param size - Image size (e.g., '1024x1024', '768x768')
   * @param steps - Number of inference steps
   * @returns Image generation response
   */
  async generateImage(prompt: string, size: string = '1024x1024', steps: number = 9) {
    const response = await this.client.post('/generate/image', {
      prompt,
      size,
      steps,
    });
    return response.data;
  }

  /**
   * Check if image generation service is available.
   */
  async checkImageServiceStatus() {
    const response = await this.client.get('/generate/image/status');
    return response.data;
  }
}

export const chatAPI = new ChatAPI();
export default chatAPI;
