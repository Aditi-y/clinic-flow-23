import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, UserCog, User } from "lucide-react";

interface LoginProps {
  userType: "doctor" | "receptionist";
}

const Login = ({ userType }: LoginProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // User type configuration
  const userTypeConfig = {
    doctor: {
      title: "Doctor Portal",
      icon: Stethoscope,
      description: "Access patient records and manage prescriptions",
      redirectTo: "/doctor-dashboard"
    },
    receptionist: {
      title: "Receptionist Portal", 
      icon: UserCog,
      description: "Manage patient registration and appointments",
      redirectTo: "/receptionist-dashboard"
    }
  };

  const config = userTypeConfig[userType];

  // Check if user is already logged in and set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // User is authenticated, redirect to appropriate dashboard
          navigate(config.redirectTo);
        }
      }
    );

    // THEN check for existing session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(config.redirectTo);
      }
    };
    checkAuth();

    return () => subscription.unsubscribe();
  }, [config.redirectTo, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}${config.redirectTo}`,
            data: {
              full_name: formData.name,
              user_type: userType,
            }
          }
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account already exists",
              description: (
                <div>
                  This email is already registered. 
                  <button 
                    onClick={handleResendConfirmation}
                    className="ml-2 text-primary underline hover:no-underline"
                  >
                    Resend confirmation email
                  </button>
                </div>
              ),
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          throw error;
        }

        // Assign role to the user after successful signup
        if (data.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: userType
            });
          
          if (roleError) {
            console.error('Error assigning role:', roleError);
          }
        }

        // Send custom confirmation email
        try {
          const emailResponse = await supabase.functions.invoke('send-confirmation', {
            body: {
              email: formData.email,
              userType: userType
            }
          });

          if (emailResponse.error) {
            console.error('Error sending confirmation email:', emailResponse.error);
          }
        } catch (emailError) {
          console.error('Failed to send custom confirmation email:', emailError);
        }

        toast({
          title: "Account created successfully!",
          description: (
            <div>
              We've sent you a confirmation email. Please check your inbox and click the verification link.
              <button 
                onClick={handleResendConfirmation}
                className="ml-2 text-primary underline hover:no-underline block mt-2"
              >
                Didn't receive it? Resend email
              </button>
            </div>
          ),
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        navigate(config.redirectTo);
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Resend Supabase verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}${config.redirectTo}`
        }
      });

      if (error) throw error;

      // Send custom confirmation email
      try {
        await supabase.functions.invoke('send-confirmation', {
          body: {
            email: formData.email,
            userType: userType
          }
        });
      } catch (emailError) {
        console.error('Failed to send custom confirmation email:', emailError);
      }

      toast({
        title: "Confirmation email resent",
        description: "Please check your inbox for the verification email.",
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-medical-blue hover:text-medical-blue/80 transition-colors">
            <User className="h-6 w-6" />
            <span className="font-semibold">Clinic Management System</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-medical-blue-light rounded-full flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-medical-blue" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {isSignUp ? `Join as ${userType}` : config.title}
              </CardTitle>
              <CardDescription className="text-medical-gray mt-2">
                {config.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="medical" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-medical-blue hover:text-medical-blue/80 text-sm font-medium transition-colors"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Need an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;