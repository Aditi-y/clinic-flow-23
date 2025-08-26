import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Stethoscope, LogOut, User, FileText, History, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - will be replaced with Supabase data
const mockPatients = [
  {
    id: 1,
    token: "T001",
    name: "John Doe",
    age: 35,
    gender: "Male",
    contact: "+1234567890",
    symptoms: "Fever, headache, body aches for 3 days",
    status: "Waiting",
    charges: 50,
    prescriptions: [],
    history: [
      {
        date: "2024-01-15",
        symptoms: "Common cold",
        prescription: "Rest, fluids, paracetamol",
        charges: 40
      }
    ]
  },
  {
    id: 2,
    token: "T002", 
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    contact: "+1234567891",
    symptoms: "Persistent cough, sore throat, mild fever",
    status: "In Consultation",
    charges: 75,
    prescriptions: [],
    history: []
  }
];

const DoctorDashboard = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const handleAddPrescription = () => {
    if (!selectedPatient || !prescription.trim()) return;

    const updatedPatients = patients.map(p => 
      p.id === selectedPatient.id 
        ? { 
            ...p, 
            prescriptions: [...(p.prescriptions || []), {
              date: new Date().toISOString().split('T')[0],
              prescription: prescription.trim(),
              doctor: "Dr. Current User" // Will be dynamic with auth
            }],
            status: "Completed"
          }
        : p
    );

    setPatients(updatedPatients);
    setPrescription("");
    setSelectedPatient(null);
    
    toast({
      title: "Prescription Added",
      description: `Prescription added for ${selectedPatient.name}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-yellow-100 text-yellow-800";
      case "In Consultation": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const startConsultation = (patient: any) => {
    setPatients(patients.map(p => 
      p.id === patient.id ? { ...p, status: "In Consultation" } : p
    ));
    setSelectedPatient(patient);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-medical-blue" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Doctor Dashboard</h1>
                <p className="text-sm text-medical-gray">Patient consultations and prescriptions</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <User className="h-4 w-4 text-medical-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === "Waiting").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
              <Stethoscope className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === "In Consultation").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-medical-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === "Completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Queue</CardTitle>
            <CardDescription>All patients scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-medical-blue text-white px-3 py-1 rounded-full font-semibold text-sm">
                        {patient.token}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-medical-gray mb-2">
                          {patient.age} years • {patient.gender}
                        </p>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm"><strong>Symptoms:</strong> {patient.symptoms}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {patient.status === "Waiting" && (
                        <Button
                          variant="medical"
                          size="sm"
                          onClick={() => startConsultation(patient)}
                        >
                          Start Consultation
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="medical-outline"
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Prescription
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Add Prescription for {patient.name}</DialogTitle>
                            <DialogDescription>
                              Token: {patient.token} • Symptoms: {patient.symptoms}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="prescription" className="text-sm font-medium">
                                Prescription Details
                              </label>
                              <Textarea
                                id="prescription"
                                placeholder="Enter medicine names, dosage, instructions..."
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                className="mt-1 min-h-[150px]"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="medical" 
                                onClick={handleAddPrescription}
                                disabled={!prescription.trim()}
                              >
                                Save Prescription
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowHistory(true);
                            }}
                          >
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Patient History - {patient.name}</DialogTitle>
                            <DialogDescription>
                              Previous visits and prescriptions
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {patient.history && patient.history.length > 0 ? (
                              patient.history.map((visit, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium">Visit {index + 1}</h4>
                                    <span className="text-sm text-medical-gray">{visit.date}</span>
                                  </div>
                                  <p className="text-sm mb-2"><strong>Symptoms:</strong> {visit.symptoms}</p>
                                  <p className="text-sm mb-2"><strong>Prescription:</strong> {visit.prescription}</p>
                                  <p className="text-sm"><strong>Charges:</strong> ${visit.charges}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-medical-gray py-8">No previous visits found</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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

export default DoctorDashboard;