import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, DollarSign, Users, LogOut, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mock data - will be replaced with Supabase data
const mockPatients = [
  {
    id: 1,
    token: "T001",
    name: "John Doe",
    age: 35,
    gender: "Male",
    contact: "+1234567890",
    symptoms: "Fever, headache",
    status: "Waiting",
    charges: 50
  },
  {
    id: 2,
    token: "T002", 
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    contact: "+1234567891",
    symptoms: "Cough, sore throat",
    status: "In Consultation",
    charges: 75
  }
];

const ReceptionistDashboard = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    symptoms: ""
  });
  const { toast } = useToast();

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `T${String(patients.length + 1).padStart(3, '0')}`;
    const patient = {
      id: patients.length + 1,
      token,
      ...newPatient,
      age: parseInt(newPatient.age),
      status: "Waiting",
      charges: 0
    };
    
    setPatients([...patients, patient]);
    setNewPatient({ name: "", age: "", gender: "", contact: "", symptoms: "" });
    setShowAddForm(false);
    
    toast({
      title: "Patient Added Successfully",
      description: `Token ${token} assigned to ${newPatient.name}`,
    });
  };

  const handleAssignCharges = (patientId: number, charges: number) => {
    setPatients(patients.map(p => 
      p.id === patientId ? { ...p, charges } : p
    ));
    
    toast({
      title: "Charges Updated",
      description: `Consultation charges of $${charges} assigned`,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-yellow-100 text-yellow-800";
      case "In Consultation": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-medical-blue" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Receptionist Dashboard</h1>
                <p className="text-sm text-medical-gray">Manage patients and appointments</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients Today</CardTitle>
              <Users className="h-4 w-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === "Waiting").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <DollarSign className="h-4 w-4 text-medical-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${patients.reduce((sum, p) => sum + p.charges, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            variant="medical" 
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add New Patient
          </Button>
        </div>

        {/* Add Patient Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Patient</CardTitle>
              <CardDescription>Enter patient information to generate a new token</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    value={newPatient.contact}
                    onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={newPatient.symptoms}
                    onChange={(e) => setNewPatient({...newPatient, symptoms: e.target.value})}
                    placeholder="Describe the patient's symptoms..."
                    required
                  />
                </div>
                
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" variant="medical">Add Patient</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>All patients registered today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-medical-blue text-white px-3 py-1 rounded-full font-semibold">
                        {patient.token}
                      </div>
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-medical-gray">
                          {patient.age}y • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-medical-gray" />
                      {patient.contact}
                    </div>
                    <div>
                      <strong>Symptoms:</strong> {patient.symptoms}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Charges: ${patient.charges}</span>
                      {patient.charges === 0 && (
                        <Button
                          size="sm"
                          variant="medical-outline"
                          onClick={() => {
                            const charges = prompt("Enter consultation charges:");
                            if (charges) handleAssignCharges(patient.id, parseInt(charges));
                          }}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;