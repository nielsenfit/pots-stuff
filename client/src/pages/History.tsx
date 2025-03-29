import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import AddSymptomModal from '@/components/AddSymptomModal';
import ExportModal from '@/components/ExportModal';
import { Symptom, SEVERITY_LEVELS } from '@shared/schema';

export default function History() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [addSymptomOpen, setAddSymptomOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Fetch symptoms
  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms'],
  });

  // Filter symptoms by search term and date
  const filteredSymptoms = symptoms.filter(symptom => {
    const matchesSearch = searchTerm === '' || 
      symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (symptom.notes && symptom.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(symptom.triggers) && symptom.triggers.some(trigger => 
        trigger.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    if (!date) return matchesSearch;
    
    const symptomDate = new Date(symptom.date);
    const selectedDate = new Date(date);
    
    return matchesSearch && 
      symptomDate.getDate() === selectedDate.getDate() &&
      symptomDate.getMonth() === selectedDate.getMonth() &&
      symptomDate.getFullYear() === selectedDate.getFullYear();
  });

  // Get severity level label
  const getSeverityLevel = (severity: number) => {
    if (severity >= SEVERITY_LEVELS.HIGH.min) return 'high';
    if (severity >= SEVERITY_LEVELS.MEDIUM.min) return 'medium';
    return 'low';
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
            <h1 className="text-xl font-bold">SymptomTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const html = document.documentElement;
                const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
                html.classList.toggle('dark', currentTheme === 'light');
                localStorage.setItem('theme', currentTheme === 'light' ? 'dark' : 'light');
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
            {/* History Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">History</h2>
                <p className="text-gray-500 dark:text-gray-400">View and manage your symptom history</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button onClick={() => setExportOpen(true)}>
                  <Download className="mr-2 h-5 w-5" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search symptoms, triggers, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal sm:w-[240px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {date && (
                <Button 
                  variant="ghost" 
                  onClick={() => setDate(undefined)}
                  className="w-full sm:w-auto"
                >
                  Clear date
                </Button>
              )}
            </div>

            {/* Symptoms List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {filteredSymptoms.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Symptom</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Triggers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSymptoms.map((symptom) => (
                      <TableRow key={symptom.id}>
                        <TableCell>
                          {format(new Date(symptom.date), "MMM d, yyyy h:mm a")}
                        </TableCell>
                        <TableCell className="font-medium">{symptom.name}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              getSeverityLevel(symptom.severity) === 'high' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
                                : getSeverityLevel(symptom.severity) === 'medium' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            }`}
                          >
                            {symptom.severity}/10
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {symptom.duration} {symptom.durationType}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {symptom.triggers && symptom.triggers.map((trigger, i) => (
                              <Badge key={i} variant="outline" className="mr-1 mb-1">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No symptoms found with the current filters.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setDate(undefined);
                    }}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav openAddSymptom={() => setAddSymptomOpen(true)} />

      {/* Add Symptom Modal */}
      <AddSymptomModal open={addSymptomOpen} onOpenChange={setAddSymptomOpen} />

      {/* Export Modal */}
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
