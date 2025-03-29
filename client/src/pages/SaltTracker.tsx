import { FC, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SaltIntake, SaltRecommendation, SALT_SOURCES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format, subDays, isToday, differenceInDays } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import AddSymptomModal from '@/components/AddSymptomModal';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  Check,
  Edit,
  Plus,
  Trash,
  AlertTriangle,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Form validation schema for adding salt intake
const saltIntakeFormSchema = z.object({
  amount: z.coerce.number().min(0.1, "Amount must be at least 0.1g").max(10, "Amount must be less than 10g"),
  source: z.string().min(1, "Please select a source"),
  date: z.date().default(() => new Date()),
  notes: z.string().optional(),
});

// Form validation schema for editing salt recommendations
const saltRecommendationFormSchema = z.object({
  dailyTarget: z.coerce.number().min(1, "Daily target must be at least 1g").max(10, "Daily target must be less than 10g"),
  maxSingleDose: z.coerce.number().min(0.1, "Max single dose must be at least 0.1g").max(5, "Max single dose must be less than 5g"),
  minDailyAmount: z.coerce.number().min(0.5, "Min daily amount must be at least 0.5g").max(5, "Min daily amount must be less than 5g"),
  recommendedSources: z.array(z.string()).optional(),
  doctorNotes: z.string().optional(),
});

// A component to show progress towards daily salt goal
const DailySaltProgress: FC<{
  intakes: SaltIntake[];
  recommendation: SaltRecommendation | undefined;
}> = ({ intakes, recommendation }) => {
  // Get today's intakes
  const todayIntakes = intakes.filter(intake => 
    isToday(new Date(intake.date))
  );
  
  // Calculate total amount consumed today
  const totalToday = todayIntakes.reduce((sum, intake) => sum + intake.amount, 0);
  
  // Default goal if no recommendation is set
  const dailyTarget = recommendation?.dailyTarget || 3.0;
  const minDailyAmount = recommendation?.minDailyAmount || 2.0;
  
  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(Math.round((totalToday / dailyTarget) * 100), 100);
  
  // Determine status based on total
  let status = "normal";
  let statusMessage = "";
  
  if (totalToday < minDailyAmount) {
    status = "danger";
    statusMessage = `You're below your minimum (${minDailyAmount}g). Try adding more salt.`;
  } else if (totalToday >= minDailyAmount && totalToday < dailyTarget) {
    status = "warning";
    statusMessage = "You're on track, but haven't reached your daily target yet.";
  } else if (totalToday >= dailyTarget && totalToday < dailyTarget * 1.5) {
    status = "success";
    statusMessage = "Great! You've reached your daily target.";
  } else {
    status = "caution";
    statusMessage = "You may have exceeded your recommended daily amount.";
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Today's Salt Intake</CardTitle>
        <CardDescription>
          {totalToday.toFixed(1)}g of {dailyTarget}g goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${
              status === "danger" ? "bg-red-200" : 
              status === "warning" ? "bg-amber-200" :
              status === "success" ? "bg-green-200" :
              status === "caution" ? "bg-orange-200" : "bg-slate-200"
            }`}
          />
          <div className="flex items-center text-sm">
            {status === "danger" && <AlertCircle className="mr-1 h-4 w-4 text-red-500" />}
            {status === "warning" && <AlertTriangle className="mr-1 h-4 w-4 text-amber-500" />}
            {status === "success" && <Check className="mr-1 h-4 w-4 text-green-500" />}
            {status === "caution" && <AlertTriangle className="mr-1 h-4 w-4 text-orange-500" />}
            <span className={`
              ${status === "danger" ? "text-red-500" : 
                status === "warning" ? "text-amber-500" :
                status === "success" ? "text-green-500" :
                status === "caution" ? "text-orange-500" : "text-slate-500"}
            `}>
              {statusMessage}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// A component to display a single salt intake entry
const SaltIntakeItem: FC<{
  intake: SaltIntake;
  onDelete: (id: number) => void;
}> = ({ intake, onDelete }) => {
  const intakeDate = new Date(intake.date);
  const dateLabel = isToday(intakeDate) 
    ? "Today" 
    : differenceInDays(new Date(), intakeDate) === 1 
      ? "Yesterday" 
      : format(intakeDate, "MMM d, yyyy");
  
  return (
    <div className="p-3 border rounded-md mb-2 flex justify-between items-center">
      <div>
        <div className="font-medium">
          {intake.amount.toFixed(1)}g from {intake.source}
        </div>
        <div className="text-sm text-gray-500">
          {dateLabel} at {format(intakeDate, "h:mm a")}
        </div>
        {intake.notes && (
          <div className="text-sm mt-1">{intake.notes}</div>
        )}
      </div>
      <div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(intake.id)}
          aria-label="Delete intake"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// A component to add a new salt intake entry
const AddSaltIntakeForm: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof saltIntakeFormSchema>>({
    resolver: zodResolver(saltIntakeFormSchema),
    defaultValues: {
      amount: 0.5,
      source: "",
      date: new Date(),
      notes: "",
    },
  });
  
  const addIntakeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof saltIntakeFormSchema>) => {
      return apiRequest("/api/salt-intakes", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salt-intakes"] });
      toast({
        title: "Salt intake added",
        description: "Your salt intake has been recorded.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to add salt intake",
        description: error.message || "There was a problem adding your salt intake.",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof saltIntakeFormSchema>) => {
    addIntakeMutation.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Salt Intake</DialogTitle>
          <DialogDescription>
            Record your salt consumption to track daily intake.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (grams)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the amount of salt in grams
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SALT_SOURCES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the source of salt
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={addIntakeMutation.isPending}>
                {addIntakeMutation.isPending ? "Adding..." : "Add Intake"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// A component to edit salt recommendation settings
const EditRecommendationForm: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: SaltRecommendation | undefined;
}> = ({ open, onOpenChange, initialData }) => {
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof saltRecommendationFormSchema>>({
    resolver: zodResolver(saltRecommendationFormSchema),
    defaultValues: {
      dailyTarget: initialData?.dailyTarget || 3.0,
      maxSingleDose: initialData?.maxSingleDose || 1.0,
      minDailyAmount: initialData?.minDailyAmount || 2.0,
      recommendedSources: initialData?.recommendedSources || [],
      doctorNotes: initialData?.doctorNotes || "",
    },
  });
  
  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        dailyTarget: initialData.dailyTarget,
        maxSingleDose: initialData.maxSingleDose || 1.0,
        minDailyAmount: initialData.minDailyAmount || 2.0,
        recommendedSources: initialData.recommendedSources || [],
        doctorNotes: initialData.doctorNotes || "",
      });
    }
  }, [initialData, form]);
  
  const updateRecommendationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof saltRecommendationFormSchema>) => {
      return apiRequest("/api/salt-recommendation", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salt-recommendation"] });
      toast({
        title: "Salt recommendations updated",
        description: "Your salt intake recommendations have been updated.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update recommendations",
        description: error.message || "There was a problem updating your salt recommendations.",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof saltRecommendationFormSchema>) => {
    updateRecommendationMutation.mutate(values);
  };
  
  const saltSourceOptions = Object.entries(SALT_SOURCES).map(([key, value]) => ({
    id: key,
    label: value,
  }));
  
  const toggleSource = (source: string) => {
    const currentSources = form.getValues().recommendedSources || [];
    if (currentSources.includes(source)) {
      form.setValue(
        "recommendedSources",
        currentSources.filter((s) => s !== source)
      );
    } else {
      form.setValue("recommendedSources", [...currentSources, source]);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Salt Recommendations</DialogTitle>
          <DialogDescription>
            Adjust your daily salt intake targets and preferences.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dailyTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Target (grams)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your recommended daily salt intake
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minDailyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Daily (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum needed daily
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxSingleDose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Single Dose (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum per dose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="recommendedSources"
              render={() => (
                <FormItem>
                  <FormLabel>Recommended Sources</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {saltSourceOptions.map((source) => {
                      const isSelected = (form.getValues().recommendedSources || []).includes(source.label);
                      return (
                        <Badge
                          key={source.id}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSource(source.label)}
                        >
                          {source.label}
                          {isSelected && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                  <FormDescription>
                    Select your preferred salt sources
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="doctorNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor's Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={updateRecommendationMutation.isPending}>
                {updateRecommendationMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Main Salt Tracker Page Component
export default function SaltTracker() {
  const [addIntakeOpen, setAddIntakeOpen] = useState(false);
  const [editRecommendationOpen, setEditRecommendationOpen] = useState(false);
  const [addSymptomOpen, setAddSymptomOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch salt intakes
  const {
    data: intakes = [],
    isLoading: isLoadingIntakes,
  } = useQuery({
    queryKey: ["/api/salt-intakes"],
    queryFn: () => apiRequest("/api/salt-intakes"),
  });
  
  // Fetch salt recommendation
  const {
    data: recommendation,
    isLoading: isLoadingRecommendation,
  } = useQuery({
    queryKey: ["/api/salt-recommendation"],
    queryFn: () => apiRequest("/api/salt-recommendation")
      .catch(error => {
        // If recommendation doesn't exist yet, return undefined
        if (error.status === 404) {
          return undefined;
        }
        throw error;
      }),
  });
  
  // Delete salt intake mutation
  const deleteIntakeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/salt-intakes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salt-intakes"] });
      toast({
        title: "Salt intake deleted",
        description: "The salt intake entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete salt intake",
        description: error.message || "There was a problem deleting the salt intake.",
      });
    },
  });
  
  const handleDeleteIntake = (id: number) => {
    if (confirm("Are you sure you want to delete this salt intake entry?")) {
      deleteIntakeMutation.mutate(id);
    }
  };
  
  // Group intakes by date for the history view
  const groupedIntakes = intakes.reduce((groups: Record<string, SaltIntake[]>, intake) => {
    const date = format(new Date(intake.date), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(intake);
    return groups;
  }, {});
  
  // Get recent intakes (last 7 days)
  const recentIntakes = intakes.filter(intake => {
    const intakeDate = new Date(intake.date);
    const sevenDaysAgo = subDays(new Date(), 7);
    return intakeDate >= sevenDaysAgo;
  });
  
  // Calculate daily totals for recent days
  const dailyTotals = Object.entries(groupedIntakes)
    .filter(([date]) => {
      const dateObj = new Date(date);
      const sevenDaysAgo = subDays(new Date(), 7);
      return dateObj >= sevenDaysAgo;
    })
    .map(([date, dayIntakes]) => {
      const total = dayIntakes.reduce((sum, intake) => sum + intake.amount, 0);
      return {
        date,
        total,
        formattedDate: format(new Date(date), "MMM d"),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
            <h1 className="text-xl font-bold">PoTs Symptom Tracker</h1>
          </div>
        </div>
      </header>

      {/* Main Content with Navigation */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <Sidebar />

        {/* Main Content */}
        <main id="main-content" className="flex-1 max-h-screen overflow-y-auto" role="main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Salt Tracker</h2>
                <p className="text-gray-500 dark:text-gray-400">Monitor your daily salt intake</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button 
                  onClick={() => setAddIntakeOpen(true)} 
                  className="inline-flex items-center"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add Intake
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditRecommendationOpen(true)}
                  className="inline-flex items-center"
                >
                  <Edit className="mr-2 h-5 w-5" /> Edit Recommendations
                </Button>
              </div>
            </div>

            {/* Main content */}
            {isLoadingIntakes || isLoadingRecommendation ? (
              <div className="flex justify-center py-10">
                <p>Loading salt tracking data...</p>
              </div>
            ) : (
              <>
                <DailySaltProgress intakes={intakes} recommendation={recommendation} />
                
                <Tabs defaultValue="today" className="mb-6">
                  <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="today">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Today's Log</CardTitle>
                        <CardDescription>
                          Salt intake entries for today
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {intakes.filter(intake => isToday(new Date(intake.date))).length > 0 ? (
                          <div className="space-y-2">
                            {intakes
                              .filter(intake => isToday(new Date(intake.date)))
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map(intake => (
                                <SaltIntakeItem 
                                  key={intake.id} 
                                  intake={intake} 
                                  onDelete={handleDeleteIntake} 
                                />
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <Calendar className="mx-auto h-10 w-10 mb-2" />
                            <p>No salt intake logged for today</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => setAddIntakeOpen(true)}
                            >
                              Add Your First Entry
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Salt Intake History</CardTitle>
                        <CardDescription>
                          Past 7 days of salt consumption
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recentIntakes.length > 0 ? (
                          <div className="space-y-6">
                            {/* Chart/visualization of daily totals */}
                            <div className="h-40 rounded-md overflow-hidden bg-slate-50 px-4 pt-4 pb-2">
                              <h3 className="text-sm font-medium mb-2">Daily Salt Consumption</h3>
                              <div className="flex items-end h-24 gap-2">
                                {dailyTotals.map((day) => (
                                  <div key={day.date} className="flex flex-col items-center flex-1">
                                    <div className="relative flex-grow w-full flex items-end mb-1">
                                      <div 
                                        className="bg-primary/70 w-full rounded-t"
                                        style={{ 
                                          height: `${Math.min((day.total / (recommendation?.dailyTarget || 3.0)) * 100, 100)}%`,
                                          minHeight: "4px"
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-xs whitespace-nowrap">{day.formattedDate}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* List of days with entries */}
                            <div>
                              {Object.entries(groupedIntakes)
                                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                                .slice(0, 7) // Limit to last 7 days with entries
                                .map(([date, dayIntakes]) => {
                                  const totalForDay = dayIntakes.reduce((sum, intake) => sum + intake.amount, 0);
                                  const dateObj = new Date(date);
                                  const displayDate = isToday(dateObj) 
                                    ? "Today" 
                                    : differenceInDays(new Date(), dateObj) === 1 
                                      ? "Yesterday" 
                                      : format(dateObj, "EEEE, MMM d");
                                      
                                  return (
                                    <div key={date} className="mb-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">{displayDate}</h3>
                                        <span className="text-sm">
                                          Total: {totalForDay.toFixed(1)}g
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        {dayIntakes
                                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                          .map(intake => (
                                            <SaltIntakeItem 
                                              key={intake.id} 
                                              intake={intake} 
                                              onDelete={handleDeleteIntake} 
                                            />
                                          ))}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="mx-auto h-10 w-10 mb-2" />
                            <p>No salt intake history found</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => setAddIntakeOpen(true)}
                            >
                              Start Tracking
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="recommendations">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Salt Intake Recommendations</CardTitle>
                        <CardDescription>
                          Your personalized salt intake guidelines
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-md">
                              <h3 className="text-sm font-medium mb-1">Daily Target</h3>
                              <p className="text-2xl font-semibold">
                                {recommendation?.dailyTarget.toFixed(1) || "3.0"}g
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Recommended daily salt intake
                              </p>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-md">
                              <h3 className="text-sm font-medium mb-1">Minimum Daily</h3>
                              <p className="text-2xl font-semibold">
                                {recommendation?.minDailyAmount?.toFixed(1) || "2.0"}g
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Minimum needed per day
                              </p>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-md">
                              <h3 className="text-sm font-medium mb-1">Max Single Dose</h3>
                              <p className="text-2xl font-semibold">
                                {recommendation?.maxSingleDose?.toFixed(1) || "1.0"}g
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Maximum per single dose
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Recommended Sources</h3>
                            {recommendation?.recommendedSources && recommendation.recommendedSources.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {recommendation.recommendedSources.map((source) => (
                                  <Badge key={source} variant="secondary">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No specific sources recommended yet. Edit your recommendations to add preferred sources.
                              </p>
                            )}
                          </div>
                          
                          {recommendation?.doctorNotes && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium mb-2">Doctor's Notes</h3>
                              <div className="bg-slate-50 p-3 rounded-md text-sm">
                                {recommendation.doctorNotes}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setEditRecommendationOpen(true)}
                              className="w-full"
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit Recommendations
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav openAddSymptom={() => setAddSymptomOpen(true)} />

      {/* Modals */}
      <AddSaltIntakeForm open={addIntakeOpen} onOpenChange={setAddIntakeOpen} />
      <EditRecommendationForm 
        open={editRecommendationOpen} 
        onOpenChange={setEditRecommendationOpen} 
        initialData={recommendation}
      />
      <AddSymptomModal 
        open={addSymptomOpen} 
        onOpenChange={setAddSymptomOpen} 
      />
    </div>
  );
}