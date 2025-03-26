import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2, Activity } from "lucide-react";
import { Appointment } from "@shared/schema";
import { format } from "date-fns";

interface AppointmentListProps {
  appointments: (Appointment & { doctor: { firstName: string; lastName: string } })[];
  onNewAppointment: () => void;
  onEditAppointment: (id: number) => void;
  onDeleteAppointment: (id: number) => void;
}

export default function AppointmentList({
  appointments,
  onNewAppointment,
  onEditAppointment,
  onDeleteAppointment,
}: AppointmentListProps) {
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-neutral-200 flex justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Upcoming Appointments</CardTitle>
          <CardDescription className="mt-1 text-sm text-neutral-500">Your scheduled visits with your care team.</CardDescription>
        </div>
        <Button
          onClick={onNewAppointment}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          New Appointment
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-neutral-200 overflow-hidden">
          {appointments.length === 0 ? (
            <li className="p-4 text-center text-neutral-500">No upcoming appointments</li>
          ) : (
            appointments.map((appointment) => (
              <li key={appointment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`bg-primary-light p-3 rounded-lg`}>
                      {appointment.purpose.toLowerCase().includes("calibration") ? (
                        <Activity className="h-6 w-6 text-white" />
                      ) : (
                        <Calendar className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </div>
                      <div className="text-sm text-neutral-500">{appointment.purpose}</div>
                      <div className="text-sm text-neutral-500">
                        {format(new Date(appointment.dateTime), "MMMM d, yyyy • h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditAppointment(appointment.id)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteAppointment(appointment.id)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-neutral-200 px-4 py-4">
        <Button 
          variant="link" 
          onClick={() => window.location.href = "/appointments"} 
          className="text-sm font-medium text-primary hover:text-primary-light p-0"
        >
          View all appointments
        </Button>
      </CardFooter>
    </Card>
  );
}
