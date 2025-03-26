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
      
      // Handle different user query types - Expanded with more use cases
      if (userMessageLower.includes("discomfort") || userMessageLower.includes("pain")) {
        responseContent = `I'm sorry to hear that. Discomfort could be caused by several factors:
          • Improper fitting of your prosthesis
          • Sensitivity adjustment needed for your Suralis system
          • Skin irritation at contact points
          
          Would you like me to schedule an urgent appointment with Dr. Müller, or would you prefer to speak with a support specialist now?`;
      } 
      // USE CASE 1: Calibration Questions
      else if (userMessageLower.includes("calibration") || 
          (userMessageLower.includes("adjust") && userMessageLower.includes("suralis"))) {
        responseContent = `Your Suralis system requires regular calibration to maintain optimal performance:
          • Standard calibration: Every 3 months
          • Fine-tuning: When sensitivity feels off
          • Full recalibration: After any physical therapy changes
          
          Your last calibration was on February 15, 2025. Would you like me to schedule your next calibration appointment?`;
      }
      // USE CASE 2: Phantom Pain Management
      else if ((userMessageLower.includes("phantom") && userMessageLower.includes("pain")) || 
          userMessageLower.includes("sensation")) {
        responseContent = `Phantom pain is common with prosthetic users. Your Suralis system is designed to help reduce these sensations by:
          • Redirecting nerve signals through targeted feedback
          • Providing sensory substitution in the affected area
          • Gradually retraining your neural pathways
          
          Your current phantom pain score is 4 (down from 7 last month). Would you like tips for managing phantom pain or should I connect you with Dr. Müller to discuss medication options?`;
      }
      // USE CASE 3: Battery and Charging Questions
      else if (userMessageLower.includes("battery") || userMessageLower.includes("charge") || 
          userMessageLower.includes("power")) {
        responseContent = `Your Suralis system battery information:
          • Current charge: 87%
          • Estimated runtime: 4 days
          • Charging time: 2 hours for full charge
          
          Best practices:
          • Charge when below 20% for optimal battery life
          • Use only the approved Saphenus charging equipment
          • Store the backup battery in a cool, dry place
          
          Do you need help with charging issues or would you like to order a replacement battery?`;
      }
      // USE CASE 4: Activity Recommendations
      else if (userMessageLower.includes("exercise") || userMessageLower.includes("activity") || 
          userMessageLower.includes("workout")) {
        responseContent = `Based on your health metrics, here are recommended activities:
          • Low-impact walking: 30 minutes daily
          • Specialized prosthetic exercises: 15 minutes, 3x weekly
          • Balance training: 10 minutes daily
          
          Your mobility score has improved by 12% following these recommendations. Would you like me to show you detailed exercise instructions or connect you with our physical therapist?`;
      }
      // USE CASE 5: Skin Care and Prosthetic Fitting
      else if (userMessageLower.includes("skin") || userMessageLower.includes("irritation") || 
          (userMessageLower.includes("prosthetic") && userMessageLower.includes("fit"))) {
        responseContent = `Proper skin care is essential for prosthetic users. Here are recommendations:
          • Clean the socket area daily with mild, fragrance-free soap
          • Apply the prescribed moisturizer to prevent dryness
          • Inspect skin daily for any red or irritated areas
          • Use the silicone liner provided by Saphenus
          
          If you're experiencing persistent skin issues, you should schedule an appointment with Dr. Müller. Would you like me to do that for you?`;
      }
      // Original use cases
      else if (userMessageLower.includes("appointment")) {
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
                
                {/* Calibration responses */}
                {messages[messages.length - 1].content.includes("Standard calibration") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("Yes, please schedule my next calibration appointment");
                        handleSendMessage();
                      }}
                    >
                      Schedule Calibration
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("Why is regular calibration important?");
                        handleSendMessage();
                      }}
                    >
                      Learn More
                    </Button>
                  </>
                )}
                
                {/* Phantom pain responses */}
                {messages[messages.length - 1].content.includes("Phantom pain is common") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("I'd like tips for managing phantom pain");
                        handleSendMessage();
                      }}
                    >
                      Pain Management Tips
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("Connect me with Dr. Müller about medication options");
                        handleSendMessage();
                      }}
                    >
                      Discuss Medication
                    </Button>
                  </>
                )}
                
                {/* Battery info responses */}
                {messages[messages.length - 1].content.includes("battery information") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("I need help with charging issues");
                        handleSendMessage();
                      }}
                    >
                      Charging Help
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("I'd like to order a replacement battery");
                        handleSendMessage();
                      }}
                    >
                      Order Battery
                    </Button>
                  </>
                )}
                
                {/* Exercise responses */}
                {messages[messages.length - 1].content.includes("recommended activities") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("Show me detailed exercise instructions");
                        handleSendMessage();
                      }}
                    >
                      Exercise Instructions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("Connect me with a physical therapist");
                        handleSendMessage();
                      }}
                    >
                      Contact Therapist
                    </Button>
                  </>
                )}
                
                {/* Skin care responses */}
                {messages[messages.length - 1].content.includes("Proper skin care") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessage("Yes, schedule an appointment with Dr. Müller");
                        handleSendMessage();
                      }}
                    >
                      Schedule Appointment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMessage("What moisturizer should I use?");
                        handleSendMessage();
                      }}
                    >
                      Ask About Products
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
                
                {/* General quick responses always available if no specific context detected */}
                {!messages[messages.length - 1].content.includes("discomfort") && 
                 !messages[messages.length - 1].content.includes("Standard calibration") &&
                 !messages[messages.length - 1].content.includes("Phantom pain is common") &&
                 !messages[messages.length - 1].content.includes("battery information") &&
                 !messages[messages.length - 1].content.includes("recommended activities") &&
                 !messages[messages.length - 1].content.includes("Proper skin care") &&
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
