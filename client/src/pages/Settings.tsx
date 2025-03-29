import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAccessibility } from '@/hooks/useAccessibility';
import AddSymptomModal from '@/components/AddSymptomModal';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, X } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UserProfile, InsertUserProfile, REMINDER_PREFERENCES } from '@shared/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import localforage from 'localforage';

// Create a form schema for profile
const profileFormSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email({ message: "Please enter a valid email" }).optional().nullable(),
  diagnosisDate: z.date().optional().nullable(),
  doctorName: z.string().optional().nullable(),
  doctorPhone: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  reminderPreference: z.string().optional().nullable(),
  healthConditions: z.array(z.string()).optional().nullable(),
});

export default function Settings() {
  const [addSymptomOpen, setAddSymptomOpen] = useState(false);
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useLocalStorage('theme', 'dark');
  const [offlineMode, setOfflineMode] = useLocalStorage('offlineMode', true);
  const queryClient = useQueryClient();
  const { 
    highContrast, 
    setHighContrast, 
    largeText, 
    setLargeText, 
    screenReaderOptimized, 
    setScreenReaderOptimized 
  } = useAccessibility();
  
  // For health conditions management
  const [newCondition, setNewCondition] = useState('');
  
  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
    onSuccess: (data) => {
      console.log("Profile loaded:", data);
    }
  });
  
  // Set up react-hook-form
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      diagnosisDate: profile?.diagnosisDate ? new Date(profile.diagnosisDate) : undefined,
      doctorName: profile?.doctorName || "",
      doctorPhone: profile?.doctorPhone || "",
      emergencyContact: profile?.emergencyContact || "",
      emergencyPhone: profile?.emergencyPhone || "",
      reminderPreference: profile?.reminderPreference || REMINDER_PREFERENCES.APP,
      healthConditions: profile?.healthConditions || [],
    }
  });
  
  // Update form values when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        diagnosisDate: profile.diagnosisDate ? new Date(profile.diagnosisDate) : undefined,
        doctorName: profile.doctorName || "",
        doctorPhone: profile.doctorPhone || "",
        emergencyContact: profile.emergencyContact || "",
        emergencyPhone: profile.emergencyPhone || "",
        reminderPreference: profile.reminderPreference || REMINDER_PREFERENCES.APP,
        healthConditions: profile.healthConditions || [],
      });
    }
  }, [profile, form]);
  
  // Handle adding new health condition
  const addHealthCondition = () => {
    if (!newCondition.trim()) return;
    
    const currentConditions = form.getValues("healthConditions") || [];
    if (!currentConditions.includes(newCondition.trim())) {
      form.setValue("healthConditions", [...currentConditions, newCondition.trim()]);
    }
    setNewCondition("");
  };
  
  // Handle removing health condition
  const removeHealthCondition = (condition: string) => {
    const currentConditions = form.getValues("healthConditions") || [];
    form.setValue(
      "healthConditions", 
      currentConditions.filter(c => c !== condition)
    );
  };
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertUserProfile>) => {
      return await apiRequest('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle profile form submission
  const onSubmitProfile = (data: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  const handleClearData = async () => {
    try {
      await localforage.clear();
      toast({
        title: "Data cleared",
        description: "All locally stored data has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error clearing data",
        description: "There was a problem clearing the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    toast({
      title: "Import functionality",
      description: "This feature will be available in a future update.",
    });
  };

  const handleResetSettings = () => {
    // Reset appearance settings
    setDarkMode('dark');
    setOfflineMode(true);
    document.documentElement.classList.add('dark');
    
    // Reset accessibility settings
    setHighContrast(false);
    setLargeText(false);
    setScreenReaderOptimized(false);
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to their default values.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
            <h1 className="text-xl font-bold">PoTs Symptom Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const html = document.documentElement;
                const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
                html.classList.toggle('dark', newTheme === 'dark');
                setDarkMode(newTheme);
              }}
              className="rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span>JS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Navigation */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 max-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Settings Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-gray-500 dark:text-gray-400">Manage your app preferences and data</p>
            </div>

            <Tabs defaultValue="preferences" className="space-y-6">
              <TabsList>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="data">Data Management</TabsTrigger>
                <TabsTrigger value="support">Help & Support</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your profile information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormDescription>
                                  Your name as you'd like it to appear in the app
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email */}
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="email@example.com" 
                                    {...field} 
                                    value={field.value || ""} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Used for notifications if enabled
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Diagnosis Date */}
                          <FormField
                            control={form.control}
                            name="diagnosisDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>PoTS/Diagnosis Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
                                      selected={field.value || undefined}
                                      onSelect={field.onChange}
                                      disabled={(date) => date > new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormDescription>
                                  When you were diagnosed with PoTS or your condition
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Health Conditions */}
                          <FormField
                            control={form.control}
                            name="healthConditions"
                            render={() => (
                              <FormItem>
                                <div className="space-y-2">
                                  <FormLabel>Health Conditions</FormLabel>
                                  
                                  {form.getValues("healthConditions")?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                      {form.getValues("healthConditions")?.map((condition) => (
                                        <Badge key={condition} variant="secondary" className="flex items-center">
                                          {condition}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 p-0"
                                            onClick={() => removeHealthCondition(condition)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : null}
                                  
                                  <div className="flex">
                                    <Input
                                      placeholder="Add condition (e.g., PoTS, EDS, etc.)"
                                      value={newCondition}
                                      onChange={(e) => setNewCondition(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          addHealthCondition();
                                        }
                                      }}
                                    />
                                    <Button 
                                      type="button"
                                      variant="outline" 
                                      className="ml-2" 
                                      onClick={addHealthCondition}
                                      disabled={!newCondition.trim()}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                  <FormDescription>
                                    List your health conditions for context
                                  </FormDescription>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                            
                            {/* Emergency Contact Name */}
                            <FormField
                              control={form.control}
                              name="emergencyContact"
                              render={({ field }) => (
                                <FormItem className="mb-4">
                                  <FormLabel>Emergency Contact Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Contact name" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormDescription>
                                    Name of your emergency contact
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Emergency Phone */}
                            <FormField
                              control={form.control}
                              name="emergencyPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Emergency Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Phone number" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormDescription>
                                    Phone number for emergencies
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div>
                            <h3 className="text-lg font-medium mb-4">Healthcare Provider</h3>
                            
                            {/* Doctor Name */}
                            <FormField
                              control={form.control}
                              name="doctorName"
                              render={({ field }) => (
                                <FormItem className="mb-4">
                                  <FormLabel>Doctor's Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doctor's name" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormDescription>
                                    Your primary healthcare provider
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Doctor Phone */}
                            <FormField
                              control={form.control}
                              name="doctorPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Doctor's Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doctor's phone" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormDescription>
                                    Contact number for your doctor
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Separator />
                        
                        {/* Reminder Preferences */}
                        <FormField
                          control={form.control}
                          name="reminderPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reminder Preferences</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value || REMINDER_PREFERENCES.APP}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select how you want to receive reminders" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={REMINDER_PREFERENCES.APP}>In-App Notifications</SelectItem>
                                  <SelectItem value={REMINDER_PREFERENCES.EMAIL}>Email Notifications</SelectItem>
                                  <SelectItem value={REMINDER_PREFERENCES.BOTH}>Both App and Email</SelectItem>
                                  <SelectItem value={REMINDER_PREFERENCES.NONE}>No Notifications</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How you want to receive medication and tracking reminders
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => form.reset()}
                        >
                          Reset
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance & Behavior</CardTitle>
                    <CardDescription>
                      Customize how the app looks and behaves
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Use dark theme to reduce eye strain
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={darkMode === 'dark'}
                        onCheckedChange={(checked) => {
                          const newTheme = checked ? 'dark' : 'light';
                          document.documentElement.classList.toggle('dark', checked);
                          setDarkMode(newTheme);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="offline-mode">Offline Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Store data locally for offline access
                        </p>
                      </div>
                      <Switch 
                        id="offline-mode" 
                        checked={offlineMode}
                        onCheckedChange={setOfflineMode}
                      />
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-2">Accessibility Options</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="high-contrast">High Contrast Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Increase contrast for better visibility
                        </p>
                      </div>
                      <Switch 
                        id="high-contrast" 
                        checked={highContrast}
                        onCheckedChange={setHighContrast}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="large-text">Large Text Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Increase text size throughout the app
                        </p>
                      </div>
                      <Switch 
                        id="large-text" 
                        checked={largeText}
                        onCheckedChange={setLargeText}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Make app more compatible with screen readers
                        </p>
                      </div>
                      <Switch 
                        id="screen-reader" 
                        checked={screenReaderOptimized}
                        onCheckedChange={setScreenReaderOptimized}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Reset to defaults</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset settings?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reset all settings to their default values. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetSettings}>
                            Reset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => {
                      toast({
                        title: "Settings saved",
                        description: "Your preferences have been updated.",
                      });
                    }}>Save changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Import, export, or clear your symptom data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Export Data</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Download your symptom data as a CSV file
                      </p>
                      <Button asChild className="w-full sm:w-auto">
                        <a href="/api/export/csv" download="symptoms_export.csv">
                          Export as CSV
                        </a>
                      </Button>
                    </div>

                    <div>
                      <Label>Import Data</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Upload a previously exported data file
                      </p>
                      <div className="flex gap-2">
                        <Input type="file" disabled />
                        <Button onClick={handleImportData} disabled>Import</Button>
                      </div>
                    </div>

                    <div>
                      <Label>Clear Data</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Remove all your symptom data from the app
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full sm:w-auto">Clear all data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete all your symptom data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData}>
                              Yes, clear all data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>
                      Resources to help you manage your condition
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <h4 className="font-medium text-primary">How do I log a new symptom?</h4>
                          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                            Tap the "+" button at the bottom of the screen or use the "Add Symptom" button on the Dashboard. Fill in the details about your symptom, including severity, duration, and any triggers.
                          </p>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <h4 className="font-medium text-primary">How do I add or manage medications?</h4>
                          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                            Navigate to the Medications tab using the sidebar or bottom navigation. Click "Add Medication" to add a new entry. You can set reminders and track your medication schedule.
                          </p>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <h4 className="font-medium text-primary">Can I export my data to share with my doctor?</h4>
                          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                            Yes! Go to Settings, then Data Management, and click "Export as CSV". This will download a file you can send to your healthcare provider or open in spreadsheet software.
                          </p>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <h4 className="font-medium text-primary">How do I use the app when I don't have internet?</h4>
                          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                            Enable "Offline Mode" in Settings, then Preferences. This will store your data locally on your device, and it will sync when you're back online.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Useful Resources</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">PoTS Resources</h4>
                          <ul className="mt-1 space-y-2">
                            <li>
                              <a 
                                href="https://www.potsuk.org/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center"
                              >
                                PoTS UK
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                </svg>
                              </a>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Information and support for PoTS patients in the UK</p>
                            </li>
                            <li>
                              <a 
                                href="https://www.dysautonomiainternational.org/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center"
                              >
                                Dysautonomia International
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                </svg>
                              </a>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Support and research for autonomic nervous system disorders</p>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Chronic Illness Management</h4>
                          <ul className="mt-1 space-y-2">
                            <li>
                              <a 
                                href="https://www.nhs.uk/conditions/postural-tachycardia-syndrome/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center"
                              >
                                NHS PoTS Information
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                </svg>
                              </a>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Official NHS guidance on PoTS</p>
                            </li>
                            <li>
                              <a 
                                href="https://www.mayoclinic.org/diseases-conditions/postural-tachycardia-syndrome/symptoms-causes/syc-20355711" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center"
                              >
                                Mayo Clinic PoTS Guide
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                </svg>
                              </a>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive information on symptoms and treatment</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Having issues with the app or need assistance? Get in touch with our support team.
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm font-medium">Email Support</p>
                        <a href="mailto:support@potssymptomtracker.com" className="text-primary hover:underline">
                          support@potssymptomtracker.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About PoTs Symptom Tracker</CardTitle>
                    <CardDescription>
                      Information about the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Version</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">1.0.0</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PoTs Symptom Tracker is a web-based application for people with PoTs and other chronic illnesses
                        to track symptoms, identify patterns, and share data with healthcare providers.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Features</h3>
                      <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 mt-1 space-y-1">
                        <li>Symptom logging with severity, triggers, and duration</li>
                        <li>History tracking with past logs visualization</li>
                        <li>Data insights with charts and graphs</li>
                        <li>Export logs as CSV</li>
                        <li>Offline capability using local storage</li>
                        <li>Dark mode support</li>
                        <li>Accessibility options (high contrast, large text, screen reader support)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav openAddSymptom={() => setAddSymptomOpen(true)} />

      {/* Add Symptom Modal */}
      <AddSymptomModal open={addSymptomOpen} onOpenChange={setAddSymptomOpen} />
    </div>
  );
}
