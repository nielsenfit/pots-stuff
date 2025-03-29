import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SymptomSummary from '@/components/SymptomSummary';
import TrendsChart from '@/components/TrendsChart';
import RecentSymptoms from '@/components/RecentSymptoms';
import QuickAdd from '@/components/QuickAdd';
import AddSymptomModal from '@/components/AddSymptomModal';
import ExportModal from '@/components/ExportModal';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter } from 'lucide-react';
import { Symptom } from '@shared/schema';

export default function Dashboard() {
  const [addSymptomOpen, setAddSymptomOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Fetch symptoms data
  const { data } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms'],
  });
  
  // Ensure we always have a properly typed array
  const symptoms: Symptom[] = data || [];

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
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">Keep track of your symptoms and wellbeing</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button
                  onClick={() => setExportOpen(true)}
                  className="inline-flex items-center"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="inline-flex items-center"
                >
                  <Filter className="mr-2 h-5 w-5" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Symptom Summary */}
            <SymptomSummary symptoms={symptoms} />

            {/* Trends Chart */}
            <TrendsChart symptoms={symptoms} />

            {/* Recent Entries */}
            <RecentSymptoms symptoms={symptoms} />

            {/* Quick Add */}
            <QuickAdd onSymptomClick={(name) => {
              setAddSymptomOpen(true);
            }} />
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
