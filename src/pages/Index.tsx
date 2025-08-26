import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, UserCog, Shield, Users, FileText, Clock } from "lucide-react";
import clinicHero from "@/assets/clinic-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-medical-blue-light to-white min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 z-10"></div>
        <img 
          src={clinicHero} 
          alt="Modern medical clinic interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Clinic Management 
                <span className="text-medical-blue block">System</span>
              </h1>
              <p className="text-xl text-medical-gray mb-8 leading-relaxed">
                Simplifying patient records and doctor-secretary communication with modern, 
                secure, and efficient digital solutions.
              </p>
              
              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-medical-blue" />
                  <span className="text-medical-gray">Secure Patient Records</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-medical-blue" />
                  <span className="text-medical-gray">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-medical-blue" />
                  <span className="text-medical-gray">Digital Prescriptions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-medical-blue" />
                  <span className="text-medical-gray">Multi-user Access</span>
                </div>
              </div>
            </div>

            {/* Right Column - Login Cards */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">Choose Your Portal</h2>
                <p className="text-medical-gray">Select your role to access the system</p>
              </div>

              {/* Doctor Login Card */}
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-medical-blue/20">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-medical-blue-light rounded-full flex items-center justify-center mb-4">
                    <Stethoscope className="h-8 w-8 text-medical-blue" />
                  </div>
                  <CardTitle className="text-xl font-bold">Doctor Portal</CardTitle>
                  <CardDescription className="text-medical-gray">
                    Access patient records, add prescriptions, and review medical history
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to="/doctor-login">
                    <Button variant="medical" size="lg" className="w-full">
                      Doctor Login
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Receptionist Login Card */}
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-medical-blue/20">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-medical-blue-light rounded-full flex items-center justify-center mb-4">
                    <UserCog className="h-8 w-8 text-medical-blue" />
                  </div>
                  <CardTitle className="text-xl font-bold">Receptionist Portal</CardTitle>
                  <CardDescription className="text-medical-gray">
                    Register new patients, assign tokens, and manage billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to="/receptionist-login">
                    <Button variant="medical-outline" size="lg" className="w-full">
                      Receptionist Login
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Streamlined Healthcare Management
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto">
              Our comprehensive system enhances communication between medical staff 
              and improves patient care through efficient record management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-medical-blue-light rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-medical-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Patient Management</h3>
              <p className="text-medical-gray">
                Efficiently register patients, generate tokens, and track their journey 
                through the clinic visit process.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-medical-blue-light rounded-full flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-medical-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Digital Records</h3>
              <p className="text-medical-gray">
                Maintain comprehensive digital patient records including prescriptions, 
                billing, and medical history.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-medical-blue-light rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-medical-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Reliable</h3>
              <p className="text-medical-gray">
                Built with security in mind, ensuring patient data privacy and 
                system reliability for daily operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-medical-blue text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Clinic Management System. Built for efficient healthcare operations.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
