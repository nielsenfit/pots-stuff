import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useQuery } from '@tanstack/react-query';
import { Symptom, SEVERITY_LEVELS } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { startOfWeek, format, addDays, subWeeks, subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import AddSymptomModal from '@/components/AddSymptomModal';

export default function Insights() {
  const [period, setPeriod] = useState('week');
  const [addSymptomOpen, setAddSymptomOpen] = useState(false);

  // Fetch symptoms
  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms'],
  });

  // Filter data based on selected period
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    if (period === 'week') {
      startDate = subWeeks(now, 1);
    } else if (period === 'month') {
      startDate = subMonths(now, 1);
    } else { // quarter
      startDate = subMonths(now, 3);
    }

    return symptoms.filter(symptom => {
      const date = new Date(symptom.date);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  const filteredData = getFilteredData();

  // Prepare data for severity distribution (pie chart)
  const getSeverityDistribution = () => {
    const counts = {
      [SEVERITY_LEVELS.LOW.label]: 0,
      [SEVERITY_LEVELS.MEDIUM.label]: 0,
      [SEVERITY_LEVELS.HIGH.label]: 0,
    };

    filteredData.forEach(symptom => {
      if (symptom.severity <= SEVERITY_LEVELS.LOW.max) {
        counts[SEVERITY_LEVELS.LOW.label]++;
      } else if (symptom.severity <= SEVERITY_LEVELS.MEDIUM.max) {
        counts[SEVERITY_LEVELS.MEDIUM.label]++;
      } else {
        counts[SEVERITY_LEVELS.HIGH.label]++;
      }
    });

    return [
      { name: SEVERITY_LEVELS.LOW.label, value: counts[SEVERITY_LEVELS.LOW.label], color: '#10B981' },
      { name: SEVERITY_LEVELS.MEDIUM.label, value: counts[SEVERITY_LEVELS.MEDIUM.label], color: '#F59E0B' },
      { name: SEVERITY_LEVELS.HIGH.label, value: counts[SEVERITY_LEVELS.HIGH.label], color: '#EF4444' },
    ];
  };

  // Prepare data for symptoms by type (bar chart)
  const getSymptomsByType = () => {
    const counts: Record<string, number> = {};

    filteredData.forEach(symptom => {
      if (counts[symptom.name]) {
        counts[symptom.name]++;
      } else {
        counts[symptom.name] = 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 symptoms
  };

  // Prepare data for weekly distribution
  const getWeeklyDistribution = () => {
    const now = new Date();
    const firstDayOfWeek = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(firstDayOfWeek, i);
      const dayStr = format(day, 'EEE');
      
      const daySymptoms = filteredData.filter(symptom => {
        const date = new Date(symptom.date);
        return format(date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const lowCount = daySymptoms.filter(s => s.severity <= SEVERITY_LEVELS.LOW.max).length;
      const mediumCount = daySymptoms.filter(s => s.severity > SEVERITY_LEVELS.LOW.max && s.severity <= SEVERITY_LEVELS.MEDIUM.max).length;
      const highCount = daySymptoms.filter(s => s.severity > SEVERITY_LEVELS.MEDIUM.max).length;

      days.push({
        day: dayStr,
        [SEVERITY_LEVELS.LOW.label]: lowCount,
        [SEVERITY_LEVELS.MEDIUM.label]: mediumCount,
        [SEVERITY_LEVELS.HIGH.label]: highCount,
      });
    }

    return days;
  };

  // Get common triggers 
  const getCommonTriggers = () => {
    const counts: Record<string, number> = {};

    filteredData.forEach(symptom => {
      if (symptom.triggers && Array.isArray(symptom.triggers)) {
        symptom.triggers.forEach(trigger => {
          if (counts[trigger]) {
            counts[trigger]++;
          } else {
            counts[trigger] = 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5 triggers
  };

  const severityDistribution = getSeverityDistribution();
  const symptomsByType = getSymptomsByType();
  const weeklyDistribution = getWeeklyDistribution();
  const commonTriggers = getCommonTriggers();

  const severityColors = {
    [SEVERITY_LEVELS.LOW.label]: '#10B981',
    [SEVERITY_LEVELS.MEDIUM.label]: '#F59E0B',
    [SEVERITY_LEVELS.HIGH.label]: '#EF4444',
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
            <button
              onClick={() => {
                const html = document.documentElement;
                const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
                html.classList.toggle('dark', currentTheme === 'light');
                localStorage.setItem('theme', currentTheme === 'light' ? 'dark' : 'light');
              }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
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
            {/* Insights Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Insights</h2>
                <p className="text-gray-500 dark:text-gray-400">Analyze your symptom patterns and trends</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Tabs value={period} onValueChange={setPeriod}>
                  <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="quarter">Quarter</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symptom Severity Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Severity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={severityDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {severityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Symptoms by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={symptomsByType}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366F1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Symptom Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={weeklyDistribution}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey={SEVERITY_LEVELS.LOW.label} stackId="a" fill={severityColors[SEVERITY_LEVELS.LOW.label]} />
                          <Bar dataKey={SEVERITY_LEVELS.MEDIUM.label} stackId="a" fill={severityColors[SEVERITY_LEVELS.MEDIUM.label]} />
                          <Bar dataKey={SEVERITY_LEVELS.HIGH.label} stackId="a" fill={severityColors[SEVERITY_LEVELS.HIGH.label]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Triggers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Common Triggers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={commonTriggers}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={120} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <h3 className="text-xl font-medium mb-2">No symptom data available</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                    Start logging your symptoms to see insights and trends.
                  </p>
                </CardContent>
              </Card>
            )}
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
