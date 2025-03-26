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
      const userMessageLower = message.toLowerCase();
      
      // Handle different user query types
      if (userMessageLower.includes("discomfort") || userMessageLower.includes("pain")) {
        responseContent = `I'm sorry to hear that. Discomfort could be caused by several factors:
          • Improper fitting of your prosthesis
          • Sensitivity adjustment needed for your Suralis system
          • Skin irritation at contact points
          
          Would you like me to schedule an urgent appointment with Dr. Müller, or would you prefer to speak with a support specialist now?`;
      } else if (userMessageLower.includes("appointment")) {
        responseContent = "I can help you schedule an appointment. When would you like to visit your doctor? You can also go directly to the Appointments section from the sidebar to schedule one yourself.";
      } else if (userMessageLower.includes("medication") || userMessageLower.includes("prescription")) {
        responseContent = "I can check your current prescriptions. You currently have 2 active prescriptions: Gabapentin for pain management and Physical Therapy. You can view and manage your prescriptions in the Prescriptions section.";
      } else if (userMessageLower.includes("suralis") || userMessageLower.includes("prosthetic") || userMessageLower.includes("device")) {
        responseContent = `Your Suralis sensory feedback system is functioning normally. The last diagnostic showed:
          • Battery: 87% 
          • Sensor sensitivity: Optimal
          • Connection quality: Good
          
          Your last calibration was 3 weeks ago. Would you like to schedule a calibration appointment?`;
      } else if (userMessageLower.includes("support") || userMessageLower.includes("help")) {
        responseContent = "For technical support with your Suralis system, you can create a support request in the Support section. For medical concerns, I recommend scheduling an appointment with Dr. Müller.";
      } else if (userMessageLower.includes("settings") || userMessageLower.includes("profile")) {
        responseContent = "You can update your personal information, contact details, and notification preferences in the Settings section. Is there something specific you'd like to change?";
      } else if (userMessageLower.includes("health") || userMessageLower.includes("metrics") || userMessageLower.includes("progress")) {
        responseContent = "Your health metrics are tracked in the Dashboard. Your mobility score has improved by 12% over the past month, and your phantom pain score has decreased from 7 to 4. Great progress!";
      } else {
        responseContent = "I understand you need assistance. Would you like information about your Suralis system, schedule an appointment with your doctor, or connect to our support team?";
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

            {/* Dynamic quick response buttons based on conversation context */}
            {messages.length > 0 && messages[messages.length - 1].sender === "assistant" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {/* Pain/Discomfort responses */}
                {messages[messages.length - 1].content.includes("discomfort") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("I'd like to schedule an urgent appointment");
                        handleSendMessage();
                      }}
                    >
                      Schedule Urgent Appointment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("I'd like to speak with support");
                        handleSendMessage();
                      }}
                    >
                      Connect to Support
                    </Button>
                  </>
                )}
                
                {/* Suralis/Device responses */}
                {messages[messages.length - 1].content.includes("Suralis sensory feedback system") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("Yes, I'd like to schedule a calibration appointment");
                        handleSendMessage();
                      }}
                    >
                      Schedule Calibration
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("Can you explain what the sensor sensitivity means?");
                        handleSendMessage();
                      }}
                    >
                      Ask About Sensor
                    </Button>
                  </>
                )}
                
                {/* General quick responses always available */}
                {!messages[messages.length - 1].content.includes("discomfort") && 
                 !messages[messages.length - 1].content.includes("Suralis sensory feedback system") && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMessage("Tell me about my health progress");
                        handleSendMessage();
                      }}
                    >
                      Health Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMessage("I need technical support");
                        handleSendMessage();
                      }}
                    >
                      Technical Support
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMessage("Check my prescriptions");
                        handleSendMessage();
                      }}
                    >
                      My Prescriptions
                    </Button>
                  </>
                )}
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
