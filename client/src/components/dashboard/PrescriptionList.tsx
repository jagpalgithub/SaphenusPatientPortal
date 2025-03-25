import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Prescription } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface PrescriptionListProps {
  prescriptions: (Prescription & { doctor: { firstName: string; lastName: string } })[];
}

export default function PrescriptionList({ prescriptions }: PrescriptionListProps) {
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Active Prescriptions</CardTitle>
        <CardDescription className="mt-1 text-sm text-neutral-500">Your current medications and treatment plans.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-neutral-200 overflow-hidden">
          {prescriptions.length === 0 ? (
            <li className="p-4 text-center text-neutral-500">No active prescriptions</li>
          ) : (
            prescriptions.map((prescription) => (
              <li key={prescription.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{prescription.medicationName}</div>
                    <div className="text-sm text-neutral-500">{prescription.dosage}, {prescription.frequency}</div>
                    <div className="text-sm text-neutral-500">{prescription.purpose}</div>
                    <div className="mt-1 flex items-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800 rounded-full">
                        <div className="mr-1.5 h-2 w-2 rounded-full bg-green-400" />
                        Active
                      </Badge>
                      <span className="ml-2 text-xs text-neutral-500">
                        Refills: {prescription.refillsRemaining} remaining
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <button
                      type="button"
                      className="text-primary hover:text-primary-light"
                      title="Refill prescription"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-neutral-200 px-4 py-4">
        <a href="/prescriptions" className="text-sm font-medium text-primary hover:text-primary-light">
          View prescription history
        </a>
      </CardFooter>
    </Card>
  );
}
