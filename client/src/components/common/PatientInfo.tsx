import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@shared/schema";
import { format } from "date-fns";

interface PatientInfoProps {
  patient: Patient;
  userName: string;
}

export default function PatientInfo({ patient, userName }: PatientInfoProps) {
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Personal Information</h3>
            <div className="mt-3 space-y-2">
              <div>
                <span className="text-sm font-medium text-neutral-700">Name:</span>{" "}
                <span className="text-sm text-neutral-900">{userName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Date of Birth:</span>{" "}
                <span className="text-sm text-neutral-900">
                  {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMMM d, yyyy") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Insurance Number:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.insuranceNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Address:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.address || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Phone:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Emergency Contact:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.emergencyContact || "N/A"}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Prosthetic Information</h3>
            <div className="mt-3 space-y-2">
              <div>
                <span className="text-sm font-medium text-neutral-700">Amputation Type:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.amputationType || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Amputation Date:</span>{" "}
                <span className="text-sm text-neutral-900">
                  {patient.amputationDate ? format(new Date(patient.amputationDate), "MMMM d, yyyy") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Prosthetic Type:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.prostheticType || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Prosthetic Serial #:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.prostheticSerialNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Suralis Serial #:</span>{" "}
                <span className="text-sm text-neutral-900">{patient.suralisSerialNumber || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
