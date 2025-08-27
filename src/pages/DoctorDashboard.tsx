import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Stethoscope, LogOut, User, FileText, History, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  symptoms: string;
  status: string;
  charges: number;
  created_at: string;
  prescriptions?: any[];
  history?: any[];
}

const DoctorDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescription, setPrescription] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use enhanced fetch function
  const fetchPatients = async () => {
    await fetchPatientsWithPrescriptions();
  };

  // Fetch patient history and prescriptions with enhanced data
  const fetchPatientDetails = async (patientId: string) => {
    try {
      const [historyResponse, prescriptionsResponse] = await Promise.all([
        supabase
          .from('patient_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false }),
        supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
      ]);

      return {
        history: historyResponse.data || [],
        prescriptions: prescriptionsResponse.data || []
      };
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return { history: [], prescriptions: [] };
    }
  };

  // Enhanced fetch patients with prescriptions
  const fetchPatientsWithPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          prescriptions:prescriptions(*)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPrescription = async () => {
    if (!selectedPatient || !prescription.trim()) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add prescriptions",
          variant: "destructive",
        });
        return;
      }

      // Save prescription to database
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: selectedPatient.id,
          prescription_text: prescription.trim(),
          doctor_id: user.id
        });

      if (prescriptionError) throw prescriptionError;

      // Add to patient history
      const { error: historyError } = await supabase
        .from('patient_history')
        .insert({
          patient_id: selectedPatient.id,
          visit_date: new Date().toISOString().split('T')[0],
          symptoms: selectedPatient.symptoms,
          prescription: prescription.trim(),
          charges: selectedPatient.charges || 0
        });

      if (historyError) throw historyError;

      // Update patient status to "Completed"
      const { error: statusError } = await supabase
        .from('patients')
        .update({ status: "Completed" })
        .eq('id', selectedPatient.id);

      if (statusError) throw statusError;

      // Refresh patient data
      await fetchPatients();
      
      setPrescription("");
      setSelectedPatient(null);
      
      toast({
        title: "Prescription Added",
        description: `Prescription saved successfully for ${selectedPatient.name}`,
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
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

  const startConsultation = async (patient: Patient) => {
    try {
      // Update patient status in database
      const { error } = await supabase
        .from('patients')
        .update({ status: "In Consultation" })
        .eq('id', patient.id);

      if (error) throw error;

      // Update local state
      setPatients(patients.map(p => 
        p.id === patient.id ? { ...p, status: "In Consultation" } : p
      ));
      setSelectedPatient(patient);

      toast({
        title: "Consultation Started",
        description: `Started consultation for ${patient.name}`,
      });
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast({
        title: "Error",
        description: "Failed to start consultation. Please try again.",
        variant: "destructive",
      });
    }
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-medical-gray">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-medical-gray">No patients found</p>
              </div>
            ) : (
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
                          {patient.prescriptions && patient.prescriptions.length > 0 && (
                            <div className="mt-2 p-2 bg-green-50 rounded-md border-l-4 border-green-400">
                              <p className="text-sm font-medium text-green-800">Latest Prescription:</p>
                              <p className="text-sm text-green-700">{patient.prescriptions[0].prescription_text}</p>
                            </div>
                          )}
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
                                onClick={async () => {
                                  const details = await fetchPatientDetails(patient.id);
                                  setSelectedPatient({ ...patient, ...details });
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
                                {selectedPatient?.history && selectedPatient.history.length > 0 ? (
                                  selectedPatient.history.map((visit: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium">Visit {index + 1}</h4>
                                        <span className="text-sm text-medical-gray">{new Date(visit.visit_date).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-sm mb-2"><strong>Symptoms:</strong> {visit.symptoms}</p>
                                      <p className="text-sm mb-2"><strong>Prescription:</strong> {visit.prescription}</p>
                                      <p className="text-sm"><strong>Charges:</strong> ₹{visit.charges}</p>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;