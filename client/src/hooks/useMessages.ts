import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Message, InsertMessage } from "@shared/schema";
import { useToast } from "./use-toast";

export function useMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get normalized user ID (checking both possible fields)
  const userId = user?.id || user?.userId;
  
  // Get user messages
  const { 
    data: messages,
    isLoading,
    error,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['/api/messages/user', userId],
    enabled: !!userId, // Only run query if we have a valid user ID
    staleTime: 1000 * 30, // 30 seconds for messages
  });

  // Create message mutation
  const createMutation = useMutation({
    mutationFn: (message: InsertMessage) => {
      // Log current user information for debugging
      console.log('Current user:', user);
      
      // Create a copy to avoid modifying the original object
      const messageToSend = { ...message };
      
      // Ensure sender ID is set correctly - use user.id as primary source
      if (!messageToSend.senderId && user?.id) {
        console.log('Setting senderId from user.id:', user.id);
        messageToSend.senderId = user.id;
      } else if (!messageToSend.senderId) {
        // Last resort fallback
        console.error('No valid sender ID found in user object');
        throw new Error('User ID not available. Please try logging out and back in.');
      }
      
      // Ensure timestamp is properly formatted
      if (!messageToSend.timestamp) {
        messageToSend.timestamp = new Date();
      }
      
      console.log('Sending message with final data:', messageToSend);
      return messagesApi.createMessage(messageToSend);
    },
    onSuccess: () => {
      // Force refetch messages using the correct user ID
      if (userId) {
        console.log('Message sent successfully, invalidating messages for user ID:', userId);
        queryClient.invalidateQueries({ queryKey: ['/api/messages/user', userId] });
        // Also explicitly refetch to ensure we get the latest data
        refetchMessages();
      }
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  });

  // Mark message as read mutation
  const readMutation = useMutation({
    mutationFn: (messageId: number) => 
      messagesApi.markMessageAsRead(messageId),
    onSuccess: () => {
      // Use normalized user ID for consistency
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages/user', userId] });
        // Explicitly refetch to ensure we get the latest data
        refetchMessages();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    }
  });

  // Send a new message
  const sendMessage = async (message: InsertMessage) => {
    return createMutation.mutateAsync(message);
  };

  // Mark a message as read
  const markAsRead = async (messageId: number) => {
    return readMutation.mutateAsync(messageId);
  };

  // Handle manual refresh of messages
  const refreshMessages = () => {
    if (userId) {
      console.log('Manually refreshing messages for user ID:', userId);
      return refetchMessages();
    } else {
      console.error('Cannot refresh messages: No valid user ID available');
      return Promise.reject(new Error('No valid user ID available'));
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages,
    isSending: createMutation.isPending,
    isMarking: readMutation.isPending,
  };
}
