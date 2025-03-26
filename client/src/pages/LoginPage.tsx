import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import saphenusLogo from "@/assets/saphenus-logo.svg";

// Define schema for login form validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Set up form with default values for admin
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      await login(values.username, values.password);
      navigate("/");
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in to your patient portal.",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-800">Saphenus Medical Technology</h1>
          <p className="mt-2 text-lg text-indigo-600">Restoring Sensory Experience</p>
        </div>

        {/* Login form */}
        <Card className="border-indigo-200 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Patient Portal</CardTitle>
            <CardDescription className="text-center">
              Welcome to your personalized care dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-700">
              <p className="mb-2">
                The Saphenus Patient Portal enables you to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Monitor your prosthetic device performance</li>
                <li>Track your health progress and metrics</li>
                <li>Communicate with your care team</li>
                <li>Manage appointments and prescriptions</li>
                <li>Access support when you need it</li>
              </ul>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-gray-500 flex flex-col space-y-2">
            <p>
              Saphenus Medical Technology is committed to innovation and excellence in
              prosthetic sensory feedback solutions.
            </p>
            <p>
              Our vision is to provide the best products, support innovation, and deliver
              exceptional customer service through prompt responses to patient needs.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}