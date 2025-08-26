import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, UserCog, User } from "lucide-react";

interface LoginProps {
  userType: "doctor" | "receptionist";
}

const Login = ({ userType }: LoginProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication with Supabase
    console.log("Form submitted:", formData);
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  required
                />
              </div>

              <Button type="submit" variant="medical" size="lg" className="w-full">
                {isSignUp ? "Create Account" : "Sign In"}
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