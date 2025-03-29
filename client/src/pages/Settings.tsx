import { useState } from 'react';
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
import localforage from 'localforage';

export default function Settings() {
  const [addSymptomOpen, setAddSymptomOpen] = useState(false);
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useLocalStorage('theme', 'dark');
  const [offlineMode, setOfflineMode] = useLocalStorage('offlineMode', true);
  const { 
    highContrast, 
    setHighContrast, 
    largeText, 
    setLargeText, 
    screenReaderOptimized, 
    setScreenReaderOptimized 
  } = useAccessibility();
  
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
                <TabsTrigger value="data">Data Management</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

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
