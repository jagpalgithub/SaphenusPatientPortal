import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, HelpCircle, MessageSquare, FileText, ExternalLink, Phone } from "lucide-react";

// Form validation schema
const supportRequestSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
});

type SupportRequestValues = z.infer<typeof supportRequestSchema>;

// FAQ items
const faqItems = [
  {
    question: "How often should I calibrate my Suralis system?",
    answer: "We recommend calibrating your Suralis system every 6-8 weeks, or whenever you notice changes in sensitivity or performance. Your device will also alert you when calibration is needed."
  },
  {
    question: "What should I do if I experience phantom pain?",
    answer: "If you experience phantom pain, first ensure your Suralis system is properly calibrated. Try the breathing and visualization exercises provided in your therapy plan. If pain persists or worsens, please contact your doctor or submit a support request."
  },
  {
    question: "How do I clean my prosthesis and Suralis components?",
    answer: "Clean the external components with a soft, slightly damp cloth. Never submerge your Suralis components in water. For more detailed cleaning instructions, refer to your user manual or contact support."
  },
  {
    question: "What should I do if my device shows a calibration error?",
    answer: "First, try restarting your device. If the error persists, schedule a calibration appointment with your doctor. Make sure to note any specific error codes to help diagnose the issue."
  },
  {
    question: "Can I exercise with my Suralis system?",
    answer: "Yes, the Suralis system is designed to be used during normal daily activities, including light to moderate exercise. However, avoid excessive impact or exposure to water. For high-intensity activities, consult your doctor for specific recommendations."
  }
];

export default function SupportPage() {
  const { user, profile } = useAuth();
  const { supportRequests, createSupportRequest, isLoading } = useSupportRequests();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { toast } = useToast();

  // Set up form
  const form = useForm<SupportRequestValues>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  // Toggle FAQ item expansion
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Submit support request
  const onSubmit = async (values: SupportRequestValues) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a support request",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSupportRequest({
        patientId: profile.id,
        timestamp: new Date(),
        subject: values.subject,
        description: values.description,
        status: "open",
        priority: values.priority,
      });

      form.reset();
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight text-neutral-900">Help & Support</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Get help with your Suralis system or contact our support team
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Support Request Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Submit a request and our team will get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="What do you need help with?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide as much detail as possible" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include any relevant details such as error messages, when the issue started, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low - General questions</SelectItem>
                            <SelectItem value="medium">Medium - Issues affecting usability</SelectItem>
                            <SelectItem value="high">High - Urgent problems</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Please select high priority only for urgent issues that require immediate attention
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Support Request"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Recent Support Requests */}
          {supportRequests && supportRequests.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Recent Support Requests</CardTitle>
                <CardDescription>
                  Track the status of your recent support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium">{request.subject}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                          request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                        </div>
                      </div>
                      <p className="text-sm text-neutral-500 mt-2">
                        {new Date(request.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-neutral-700 mt-2">
                        {request.description.length > 100 
                          ? `${request.description.substring(0, 100)}...` 
                          : request.description}
                      </p>
                      {request.resolutionNotes && (
                        <div className="mt-3 p-2 bg-neutral-50 rounded-md">
                          <p className="text-xs font-medium text-neutral-700">Resolution:</p>
                          <p className="text-xs text-neutral-600 mt-1">{request.resolutionNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Support Sidebar */}
        <div className="md:col-span-1">
          {/* Quick Links */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>
                Resources and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    User Manual
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Saphenus Website
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Support
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="tel:+431234567890">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Support: +43 123 456 7890
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about your Suralis system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-md overflow-hidden"
                  >
                    <button
                      className="w-full flex justify-between items-center px-4 py-3 bg-neutral-50 text-left focus:outline-none"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="text-sm font-medium text-neutral-800">{item.question}</span>
                      <AlertCircle className={`h-4 w-4 transition-transform ${expandedFaq === index ? 'transform rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 py-3 bg-white">
                        <p className="text-sm text-neutral-600">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full justify-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                View All FAQs
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
