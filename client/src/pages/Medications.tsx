import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon, Pill, Clock, Check, X, Edit, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { MEDICATION_FREQUENCY, TIMES_OF_DAY } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: string;
  endDate: string | null;
  notes: string | null;
  active: boolean;
  reminderEnabled: boolean;
  reminderTimes: string[];
};

// Form schema for adding/editing medications
const medicationFormSchema = z.object({
  name: z.string().min(1, { message: "Medication name is required" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  frequency: z.string().min(1, { message: "Frequency is required" }),
  timeOfDay: z.array(z.string()).min(1, { message: "At least one time of day is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  active: z.boolean().default(true),
  reminderEnabled: z.boolean().default(false),
  reminderTimes: z.array(z.string()).optional(),
});

export default function Medications() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const { toast } = useToast();

  // Query medications
  const { data: medications = [], isLoading, isError } = useQuery({
    queryKey: ['/api/medications'],
    queryFn: () => apiRequest('/api/medications')
  });

  // Add medication mutation
  const addMutation = useMutation({
    mutationFn: async (medication: z.infer<typeof medicationFormSchema>) => {
      return await apiRequest('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medication),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setOpenAddDialog(false);
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      });
    }
  });

  // Edit medication mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<z.infer<typeof medicationFormSchema>> }) => {
      return await apiRequest(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setOpenEditDialog(false);
      toast({
        title: "Success",
        description: "Medication updated successfully",
      });
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update medication",
        variant: "destructive",
      });
    }
  });

  // Delete medication mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/medications/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      });
    }
  });

  // Add medication form
  const addForm = useForm<z.infer<typeof medicationFormSchema>>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: MEDICATION_FREQUENCY.ONCE_DAILY,
      timeOfDay: [TIMES_OF_DAY.MORNING],
      startDate: new Date(),
      endDate: null,
      notes: "",
      active: true,
      reminderEnabled: false,
      reminderTimes: [],
    },
  });

  // Edit medication form
  const editForm = useForm<z.infer<typeof medicationFormSchema>>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: MEDICATION_FREQUENCY.ONCE_DAILY,
      timeOfDay: [TIMES_OF_DAY.MORNING],
      startDate: new Date(),
      endDate: null,
      notes: "",
      active: true,
      reminderEnabled: false,
      reminderTimes: [],
    },
  });

  function onSubmitAddMedication(data: z.infer<typeof medicationFormSchema>) {
    addMutation.mutate(data);
  }

  function onSubmitEditMedication(data: z.infer<typeof medicationFormSchema>) {
    if (editingMedication) {
      editMutation.mutate({ id: editingMedication.id, data });
    }
  }

  function handleDeleteMedication(id: number) {
    if (confirm("Are you sure you want to delete this medication?")) {
      deleteMutation.mutate(id);
    }
  }

  function handleEditMedication(medication: Medication) {
    setEditingMedication(medication);
    editForm.reset({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timeOfDay: medication.timeOfDay,
      startDate: new Date(medication.startDate),
      endDate: medication.endDate ? new Date(medication.endDate) : null,
      notes: medication.notes,
      active: medication.active,
      reminderEnabled: medication.reminderEnabled,
      reminderTimes: medication.reminderTimes,
    });
    setOpenEditDialog(true);
  }

  // Determine the most appropriate color for medication status badge
  const getMedicationStatusColor = (medication: Medication) => {
    if (!medication.active) return "gray";
    const hasEndDate = medication.endDate !== null && medication.endDate !== undefined;
    if (hasEndDate && medication.endDate) {
      try {
        const endDate = new Date(medication.endDate);
        const now = new Date();
        const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining < 0) return "destructive"; // Past end date
        if (daysRemaining < 7) return "orange"; // Less than a week remaining
        if (daysRemaining < 30) return "yellow"; // Less than a month remaining
      } catch (error) {
        console.error("Error parsing endDate:", error);
        return "green"; // Default if there's an error
      }
    }
    return "green"; // Active with no end date or plenty of time left
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 overflow-y-auto" id="main-content">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Medication Tracker</h1>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Pill className="h-4 w-4" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Medication</DialogTitle>
                  <DialogDescription>
                    Track your medications and set reminders for when to take them.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onSubmitAddMedication)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Propranolol" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 10mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(MEDICATION_FREQUENCY).map((freq) => (
                                <SelectItem key={freq} value={freq}>
                                  {freq}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="timeOfDay"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel>Time of Day</FormLabel>
                            <FormDescription>
                              Select when you need to take this medication
                            </FormDescription>
                          </div>
                          {Object.values(TIMES_OF_DAY).map((time) => (
                            <FormField
                              key={time}
                              control={addForm.control}
                              name="timeOfDay"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={time}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(time)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, time])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== time
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {time}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value ? "text-muted-foreground" : ""
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value ? "text-muted-foreground" : ""
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>No end date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  initialFocus
                                  disabled={(date) => {
                                    const startDate = addForm.getValues().startDate;
                                    return startDate && date < startDate;
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional information about this medication"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Active Medication
                            </FormLabel>
                            <FormDescription>
                              Indicate if you are currently taking this medication
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="reminderEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Reminders
                            </FormLabel>
                            <FormDescription>
                              Set up reminders to take this medication
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpenAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addMutation.isPending}
                      >
                        {addMutation.isPending ? "Saving..." : "Save Medication"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading medications...</p>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error loading medications</p>
            </div>
          ) : medications && medications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((medication) => (
                <Card key={medication.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{medication.name}</CardTitle>
                        <CardDescription>{medication.dosage}</CardDescription>
                      </div>
                      <Badge variant={
                        medication.active ? "default" : "secondary"
                      }>
                        {medication.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{medication.frequency}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {medication.timeOfDay.map((time) => (
                          <Badge key={time} variant="outline">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{format(new Date(medication.startDate), "PP")}</span>
                      </div>
                      {medication.endDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Until:</span>
                          <span>{format(new Date(medication.endDate), "PP")}</span>
                        </div>
                      )}
                    </div>
                    {medication.notes && (
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">Notes:</p>
                        <p className="text-sm mt-1">{medication.notes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {medication.reminderEnabled ? 
                          "Reminders enabled" : 
                          "No reminders"
                        }
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-secondary/10 pt-3">
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditMedication(medication)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteMedication(medication.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <Pill className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No medications yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Start tracking your medications by adding your first one.
              </p>
              <Button onClick={() => setOpenAddDialog(true)}>
                Add Your First Medication
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>
              Update your medication details and schedule.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEditMedication)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Propranolol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MEDICATION_FREQUENCY).map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
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
                name="timeOfDay"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Time of Day</FormLabel>
                      <FormDescription>
                        Select when you need to take this medication
                      </FormDescription>
                    </div>
                    {Object.values(TIMES_OF_DAY).map((time) => (
                      <FormField
                        key={time}
                        control={editForm.control}
                        name="timeOfDay"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={time}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(time)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, time])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== time
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {time}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2 border-b">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-destructive"
                              onClick={() => field.onChange(null)}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Clear date
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              const startDate = editForm.getValues().startDate;
                              return startDate && date < startDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about this medication"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Medication
                      </FormLabel>
                      <FormDescription>
                        Indicate if you are currently taking this medication
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="reminderEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Reminders
                      </FormLabel>
                      <FormDescription>
                        Set up reminders to take this medication
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? "Saving..." : "Update Medication"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}