import { useState, useCallback, useRef } from 'react';
import { chatAPI } from '../api/chat';
import { Message, ChatState } from '../types';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    isGeneratingImage: false,
    conversationId: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    conversationId?: number
  ): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Check for image generation request
    const imagePrompt = chatAPI.detectImageRequest(message);
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      isStreaming: true,
      error: null,
    }));

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
      // Mark if this is an image request
      ...(imagePrompt && {
        is_image_request: true,
        image_prompt: imagePrompt,
      }),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    try {
      // Handle image generation
      if (imagePrompt) {
        await handleImageGeneration(imagePrompt, conversationId);
        return;
      }

      // Regular chat streaming
      const stream = chatAPI.streamMessage(message, conversationId);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        conversationId: conversationId || null,
      }));

      let fullResponse = '';
      let detectedConversationId = conversationId;

      for await (const chunk of stream) {
        fullResponse += chunk;
        
        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages.slice(0, -1),
            { ...assistantMessage, content: fullResponse },
          ],
        }));
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        conversationId: detectedConversationId || prev.conversationId,
      }));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Chat error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: 'Failed to send message. Please try again.',
      }));

      setState(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const handleImageGeneration = useCallback(async (
    prompt: string,
    conversationId?: number
  ): Promise<void> => {
    try {
      // Create pending image message
      const imageMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "🖼️ Generating your image...",
        created_at: new Date().toISOString(),
        is_image_request: true,
        image_prompt: prompt,
        image_status: 'pending',
      };

      setState(prev => ({
        ...prev,
        isGeneratingImage: true,
        messages: [...prev.messages, imageMessage],
        conversationId: conversationId || null,
      }));

      // Generate image
      const response = await chatAPI.generateImage(prompt);
      
      if (response.success && response.data_url) {
        // Update message with generated image
        setState(prev => ({
          ...prev,
          isGeneratingImage: false,
          messages: prev.messages.map((msg, idx) => 
            idx === prev.messages.length - 1
              ? {
                  ...msg,
                  image_status: 'success',
                  image_data_url: response.data_url,
                  image_url: response.url,
                  content: "✨ Here's your image, dear pollinator! 🐝🎨",
                }
              : msg
          ),
        }));
      } else {
        // Handle error
        setState(prev => ({
          ...prev,
          isGeneratingImage: false,
          messages: prev.messages.map((msg, idx) => 
            idx === prev.messages.length - 1
              ? {
                  ...msg,
                  image_status: 'error',
                  image_error: response.message || 'Failed to generate image',
                  content: "Sorry, I couldn't generate that image. Please try again. 🐝",
                }
              : msg
          ),
        }));
      }

    } catch (error) {
      console.error('Image generation error:', error);
      
      setState(prev => ({
        ...prev,
        isGeneratingImage: false,
        error: 'Failed to generate image. Please try again.',
      }));
    }
  }, []);

  const regenerateImage = useCallback(async (
    messageId: number,
    prompt: string
  ): Promise<void> => {
    setState(prev => ({
      ...prev,
      isGeneratingImage: true,
    }));

    try {
      const response = await chatAPI.generateImage(prompt);
      
      setState(prev => ({
        ...prev,
        isGeneratingImage: false,
        messages: prev.messages.map(msg => 
          msg.id === messageId
            ? {
                ...msg,
                image_status: response.success ? 'success' : 'error',
                image_data_url: response.data_url,
                image_url: response.url,
                image_error: response.message,
                content: response.success 
                  ? "✨ Here's your regenerated image! 🐝🎨" 
                  : "Sorry, regeneration failed. 🐝",
              }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Image regeneration error:', error);
      
      setState(prev => ({
        ...prev,
        isGeneratingImage: false,
        error: 'Failed to regenerate image.',
      }));
    }
  }, []);

  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      isStreaming: false,
      isGeneratingImage: false,
      conversationId: null,
      error: null,
    });
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    clearChat,
    stopStreaming,
    regenerateImage,
  };
}
