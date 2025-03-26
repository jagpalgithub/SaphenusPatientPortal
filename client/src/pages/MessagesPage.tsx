import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useMedicalStaff } from "@/hooks/useMedicalStaff";
import { useMessages } from "@/hooks/useMessages";
import { format } from "date-fns";
import { Send, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MessagesPage() {
  const { user } = useAuth();
  const { doctors, isLoading: isLoadingDoctors } = useMedicalStaff();
  const { messages, sendMessage, markAsRead, isLoading, isSending } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages when conversation changes or new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation, messages]);

  // Filter doctors by search query
  const filteredDoctors = doctors?.filter(doctor => {
    const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  }) || [];

  // Get current conversation messages
  const conversationMessages = selectedConversation
    ? messages?.filter(
        msg =>
          (msg.senderId === user?.id && msg.receiverId === selectedConversation) ||
          (msg.receiverId === user?.id && msg.senderId === selectedConversation)
      )
    : [];

  // Group messages by date
  const groupedMessages: { [key: string]: typeof conversationMessages } = {};
  conversationMessages?.forEach(message => {
    const date = format(new Date(message.timestamp), "MMMM d, yyyy");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  // Mark unread messages as read
  useEffect(() => {
    if (selectedConversation && conversationMessages) {
      conversationMessages.forEach(message => {
        if (message.receiverId === user?.id && !message.isRead) {
          markAsRead(message.id);
        }
      });
    }
  }, [selectedConversation, conversationMessages, user?.id, markAsRead]);

  // Send a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    sendMessage({
      senderId: user.id,
      receiverId: selectedConversation,
      content: messageText,
      timestamp: new Date(),
      isRead: false,
    }).then(() => {
      setMessageText("");
    }).catch(error => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    });
  };

  // Get unread message count for a conversation
  const getUnreadCount = (receiverId: number) => {
    return messages?.filter(
      msg => msg.senderId === receiverId && msg.receiverId === user?.id && !msg.isRead
    ).length || 0;
  };

  // Get selected doctor
  const selectedDoctor = doctors?.find(doctor => doctor.userId === selectedConversation);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight text-neutral-900">Messages</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Communicate with your healthcare providers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Your message history with doctors</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search doctors"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingDoctors ? (
              <div className="flex justify-center p-6">
                <p>Loading conversations...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                No conversations found
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {filteredDoctors.map((doctor) => {
                  const unreadCount = getUnreadCount(doctor.userId);
                  return (
                    <li
                      key={doctor.userId}
                      className={`px-4 py-3 cursor-pointer hover:bg-neutral-50 ${
                        selectedConversation === doctor.userId ? 'bg-neutral-100' : ''
                      }`}
                      onClick={() => setSelectedConversation(doctor.userId)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {doctor.user.firstName.charAt(0)}
                            {doctor.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {doctor.specialization}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs text-white">{unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        
        {/* Messages */}
        <Card className="md:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-neutral-200">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>
                      {selectedDoctor?.user.firstName.charAt(0)}
                      {selectedDoctor?.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      Dr. {selectedDoctor?.user.firstName} {selectedDoctor?.user.lastName}
                    </CardTitle>
                    <CardDescription>{selectedDoctor?.specialization}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <p>Loading messages...</p>
                  </div>
                ) : Object.keys(groupedMessages).length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center text-neutral-500">
                    <p className="mb-2">No messages yet</p>
                    <p className="text-sm">Start a conversation with Dr. {selectedDoctor?.user.firstName} {selectedDoctor?.user.lastName}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                      <div key={date}>
                        <div className="flex justify-center mb-4">
                          <div className="bg-neutral-100 px-3 py-1 rounded-full text-xs text-neutral-500">
                            {date}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {dateMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderId === user?.id ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                  message.senderId === user?.id
                                    ? "bg-primary text-white"
                                    : "bg-neutral-100 text-neutral-800"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.senderId === user?.id
                                    ? "text-white text-opacity-70"
                                    : "text-neutral-500"
                                }`}>
                                  {format(new Date(message.timestamp), "h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-neutral-200 p-4">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isSending}
                  >
                    {isSending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-[600px] text-center text-neutral-500">
              <p className="mb-2">Select a conversation</p>
              <p className="text-sm">Choose a doctor from the list to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
