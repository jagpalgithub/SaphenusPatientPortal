import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Message, InsertMessage } from "@shared/schema";
import { useToast } from "./use-toast";

export function useMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user messages
  const { 
    data: messages,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/messages/user', user?.id],
    enabled: !!user?.id,
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
      queryClient.invalidateQueries({ queryKey: ['/api/messages/user', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/messages/user', user?.id] });
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

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    isSending: createMutation.isPending,
    isMarking: readMutation.isPending,
  };
}
