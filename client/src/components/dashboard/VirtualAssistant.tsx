import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Laptop } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: number;
  sender: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function VirtualAssistant() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      content: `Hello ${user?.firstName || 'there'}, how can I help you today? You can ask me about your Suralis system, appointment scheduling, or medication.`,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setMessage("");

    // Simulate assistant response after a short delay
    setTimeout(() => {
      // This would be replaced with actual AI assistant logic
      let responseContent = "";
      
      if (message.toLowerCase().includes("discomfort") || message.toLowerCase().includes("pain")) {
        responseContent = `I'm sorry to hear that. Discomfort could be caused by several factors:
          • Improper fitting of your prosthesis
          • Sensitivity adjustment needed for your Suralis system
          • Skin irritation at contact points
          
          Would you like me to schedule an urgent appointment with Dr. Müller, or would you prefer to speak with a support specialist now?`;
      } else if (message.toLowerCase().includes("appointment")) {
        responseContent = "I can help you schedule an appointment. When would you like to visit your doctor?";
      } else if (message.toLowerCase().includes("medication") || message.toLowerCase().includes("prescription")) {
        responseContent = "I can check your current prescriptions. You currently have 2 active prescriptions: Gabapentin for pain management and Physical Therapy.";
      } else {
        responseContent = "I understand you need assistance. Would you like to schedule an appointment with your doctor or connect to our support team?";
      }

      const assistantResponse: Message = {
        id: messages.length + 2,
        sender: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantResponse]);
    }, 1000);
  };

  return (
    <Card className="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Virtual Assistant</CardTitle>
        <CardDescription className="mt-1 text-sm text-neutral-500">
          Get help with your Suralis system or connect with support.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex">
        <div className="w-full lg:w-3/4 mx-auto">
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start mb-4 ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <Laptop className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`mx-3 px-4 py-2 rounded-lg shadow-sm ${
                    msg.sender === "assistant"
                      ? "bg-white"
                      : "bg-primary-light bg-opacity-10"
                  }`}
                >
                  <div className="text-sm text-neutral-700 whitespace-pre-line">
                    {msg.content}
                  </div>
                </div>
                {msg.sender === "user" && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImage} alt={user?.firstName || 'User'} />
                      <AvatarFallback>{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}

            {message.toLowerCase().includes("discomfort") && (
              <div className="mt-4 flex space-x-2">
                <Button
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => {
                    setMessage("I'd like to schedule an appointment");
                    handleSendMessage();
                  }}
                >
                  Schedule Appointment
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => {
                    setMessage("I'd like to speak with support");
                    handleSendMessage();
                  }}
                >
                  Connect to Support
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="relative">
              <Input
                type="text"
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <Button
                  type="submit"
                  onClick={handleSendMessage}
                  className="inline-flex items-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
