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
    mutationFn: (message: InsertMessage) => 
      messagesApi.createMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/user', user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
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
