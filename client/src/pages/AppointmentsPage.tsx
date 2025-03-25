import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { Calendar as CalendarIcon, Clock, Pencil, Trash2, Activity, User } from "lucide-react";
import { format, isBefore, isPast, addHours } from "date-fns";
import { InsertAppointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Appointment form schema
const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  dateTime: z.date().refine(date => !isBefore(date, new Date()), {
    message: "Appointment date must be in the future",
  }),
  duration: z.string().min(1, "Please select a duration"),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentsPage() {
  const { user, profile } = useAuth();
  const { appointments, doctors, createAppointment, updateAppointment, deleteAppointment, isLoading } = useAppointments();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { toast } = useToast();

  // Create appointment form
  const createForm = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      purpose: "",
      notes: "",
    },
  });

  // Edit appointment form
  const editForm = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      purpose: "",
      notes: "",
    },
  });

  // Split appointments into upcoming and past
  const upcomingAppointments = appointments?.filter(appointment => 
    !isPast(new Date(appointment.dateTime))
  ).sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  ) || [];
  
  const pastAppointments = appointments?.filter(appointment => 
    isPast(new Date(appointment.dateTime))
  ).sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  ) || [];

  // Handle creating a new appointment
  const handleCreateAppointment = async (values: AppointmentFormValues) => {
    if (!profile) return;
    
    try {
      const newAppointment: Partial<InsertAppointment> = {
        patientId: profile.id,
        doctorId: parseInt(values.doctorId),
        dateTime: values.dateTime,
        duration: parseInt(values.duration),
        purpose: values.purpose,
        notes: values.notes || null,
        status: "scheduled",
        fee: 0,
        feePaid: false,
      };
      
      await createAppointment(newAppointment as InsertAppointment);
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Appointment created",
        description: "Your appointment has been scheduled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    }
  };

  // Handle editing an appointment
  const handleEditAppointment = async (values: AppointmentFormValues) => {
    if (!currentAppointment) return;
    
    try {
      const updatedAppointment = {
        ...currentAppointment,
        doctorId: parseInt(values.doctorId),
        dateTime: values.dateTime,
        duration: parseInt(values.duration),
        purpose: values.purpose,
        notes: values.notes || null,
      };
      
      await updateAppointment(currentAppointment.id, updatedAppointment);
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({
        title: "Appointment updated",
        description: "Your appointment has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await deleteAppointment(id);
        toast({
          title: "Appointment cancelled",
          description: "Your appointment has been cancelled successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to cancel appointment",
          variant: "destructive",
        });
      }
    }
  };

  // Open edit dialog with appointment data
  const openEditDialog = (appointment: any) => {
    setCurrentAppointment(appointment);
    editForm.reset({
      doctorId: appointment.doctorId.toString(),
      dateTime: new Date(appointment.dateTime),
      duration: appointment.duration.toString(),
      purpose: appointment.purpose,
      notes: appointment.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-neutral-900">Appointments</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Schedule and manage your appointments with your care team.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            onClick={() => {
              createForm.reset({
                purpose: "",
                notes: "",
              });
              setIsCreateDialogOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            New Appointment
          </Button>
        </div>
      </div>
      
      {/* Appointments Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>View and manage your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <p>Loading upcoming appointments...</p>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center p-6 bg-neutral-50 rounded-md">
                  <CalendarIcon className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-2 text-sm font-medium text-neutral-900">No Upcoming Appointments</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    You don't have any upcoming appointments scheduled.
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Schedule New Appointment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="bg-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`bg-primary-light p-3 rounded-lg`}>
                                {appointment.purpose.toLowerCase().includes("calibration") ? (
                                  <Activity className="h-6 w-6 text-white" />
                                ) : (
                                  <User className="h-6 w-6 text-white" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-900">
                                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                </div>
                                <div className="text-sm text-neutral-500">{appointment.purpose}</div>
                                <div className="text-sm text-neutral-500">
                                  {format(new Date(appointment.dateTime), "MMMM d, yyyy • h:mm a")} • {appointment.duration} minutes
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(appointment)}
                                className="inline-flex items-center p-1 border border-transparent rounded-full text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="inline-flex items-center p-1 border border-transparent rounded-full text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-2 text-sm text-neutral-700">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <p>Loading past appointments...</p>
                </div>
              ) : pastAppointments.length === 0 ? (
                <div className="text-center p-6 bg-neutral-50 rounded-md">
                  <CalendarIcon className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-2 text-sm font-medium text-neutral-900">No Past Appointments</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    You don't have any past appointments on record.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id} className="bg-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`bg-neutral-300 p-3 rounded-lg`}>
                                {appointment.purpose.toLowerCase().includes("calibration") ? (
                                  <Activity className="h-6 w-6 text-white" />
                                ) : (
                                  <User className="h-6 w-6 text-white" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-900">
                                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                </div>
                                <div className="text-sm text-neutral-500">{appointment.purpose}</div>
                                <div className="text-sm text-neutral-500">
                                  {format(new Date(appointment.dateTime), "MMMM d, yyyy • h:mm a")} • {appointment.duration} minutes
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-medium px-2 py-1 rounded bg-neutral-100 text-neutral-800">
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-2 text-sm text-neutral-700">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new appointment with your doctor.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateAppointment)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            // Set time to current time
                            if (date) {
                              const now = new Date();
                              date.setHours(now.getHours(), now.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const timeString = e.target.value;
                              const [hours, minutes] = timeString.split(':').map(Number);
                              const date = new Date(field.value || new Date());
                              date.setHours(hours, minutes);
                              field.onChange(date);
                            }}
                            value={field.value ? format(field.value, "HH:mm") : ""}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="Reason for appointment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information for your doctor"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Appointment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the details of your appointment.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditAppointment)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Preserve the time when changing the date
                              const currentDate = field.value || new Date();
                              date.setHours(currentDate.getHours(), currentDate.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const timeString = e.target.value;
                              const [hours, minutes] = timeString.split(':').map(Number);
                              const date = new Date(field.value || new Date());
                              date.setHours(hours, minutes);
                              field.onChange(date);
                            }}
                            value={field.value ? format(field.value, "HH:mm") : ""}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="Reason for appointment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information for your doctor"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Appointment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
