import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { format } from "date-fns";
import { Prescription } from "@shared/schema";
import { RefreshCw, FileText, Pill, Activity, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const { prescriptions, isLoading, requestRefill, isRequestingRefill } = usePrescriptions();
  const [activeTab, setActiveTab] = useState("active");

  // Split prescriptions into active and inactive
  const activePrescriptions = prescriptions?.filter(p => p.isActive) || [];
  const inactivePrescriptions = prescriptions?.filter(p => !p.isActive) || [];

  // Function to get icon for prescription type
  const getPrescriptionIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="h-5 w-5 text-white" />;
      case "physical_therapy":
        return <Activity className="h-5 w-5 text-white" />;
      case "device_maintenance":
        return <RefreshCw className="h-5 w-5 text-white" />;
      default:
        return <FileText className="h-5 w-5 text-white" />;
    }
  };

  // Get background color for prescription type
  const getPrescriptionBgColor = (type: string) => {
    switch (type) {
      case "medication":
        return "bg-primary";
      case "physical_therapy":
        return "bg-secondary";
      case "device_maintenance":
        return "bg-primary-light";
      default:
        return "bg-neutral-400";
    }
  };

  const PrescriptionCard = ({ prescription }: { prescription: Prescription & { doctor: { firstName: string; lastName: string } } }) => {
    // Handle refill request
    const handleRequestRefill = async () => {
      if (prescription.id) {
        try {
          await requestRefill(prescription.id);
        } catch (error) {
          console.error("Error requesting refill:", error);
        }
      }
    };
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${getPrescriptionBgColor(prescription.type)} p-3 rounded-lg`}>
              {getPrescriptionIcon(prescription.type)}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">{prescription.medicationName}</h3>
                  <p className="text-sm text-neutral-500">{prescription.dosage}, {prescription.frequency}</p>
                </div>
                <div className="flex">
                  {prescription.isActive ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 rounded-full">
                      <div className="mr-1.5 h-2 w-2 rounded-full bg-green-400" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-neutral-100 text-neutral-800 rounded-full">
                      <div className="mr-1.5 h-2 w-2 rounded-full bg-neutral-400" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="mt-2 text-sm text-neutral-700">{prescription.purpose}</p>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-neutral-500">Start Date:</span>
                  <p className="text-sm text-neutral-700">{format(new Date(prescription.startDate), "MMMM d, yyyy")}</p>
                </div>
                {prescription.endDate && (
                  <div>
                    <span className="text-xs text-neutral-500">End Date:</span>
                    <p className="text-sm text-neutral-700">{format(new Date(prescription.endDate), "MMMM d, yyyy")}</p>
                  </div>
                )}
              </div>
              
              {prescription.refillsRemaining !== null && prescription.refillsRemaining !== undefined && (
                <div className="mt-2">
                  <span className="text-xs text-neutral-500">Refills Remaining:</span>
                  <p className="text-sm text-neutral-700">{prescription.refillsRemaining}</p>
                </div>
              )}
              
              {prescription.notes && (
                <div className="mt-2">
                  <span className="text-xs text-neutral-500">Notes:</span>
                  <p className="text-sm text-neutral-700">{prescription.notes}</p>
                </div>
              )}
              
              <div className="mt-3 flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{prescription.doctor.firstName.charAt(0)}{prescription.doctor.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-neutral-500">Prescribed by Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}</span>
              </div>
              
              {prescription.isActive && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary"
                    onClick={handleRequestRefill}
                    disabled={isRequestingRefill}
                  >
                    {isRequestingRefill ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Refill
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight text-neutral-900">Prescriptions</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your medications and treatment plans.
        </p>
      </div>
      
      {/* Prescriptions Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Prescriptions</CardTitle>
          <CardDescription>View and manage your prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active ({activePrescriptions.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactivePrescriptions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <p>Loading active prescriptions...</p>
                </div>
              ) : activePrescriptions.length === 0 ? (
                <div className="text-center p-6 bg-neutral-50 rounded-md">
                  <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-2 text-sm font-medium text-neutral-900">No Active Prescriptions</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    You don't have any active prescriptions at the moment.
                  </p>
                </div>
              ) : (
                activePrescriptions.map(prescription => (
                  <PrescriptionCard key={prescription.id} prescription={prescription} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="inactive" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <p>Loading inactive prescriptions...</p>
                </div>
              ) : inactivePrescriptions.length === 0 ? (
                <div className="text-center p-6 bg-neutral-50 rounded-md">
                  <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-2 text-sm font-medium text-neutral-900">No Inactive Prescriptions</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    You don't have any past or inactive prescriptions.
                  </p>
                </div>
              ) : (
                inactivePrescriptions.map(prescription => (
                  <PrescriptionCard key={prescription.id} prescription={prescription} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
