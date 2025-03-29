import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Symptom, SEVERITY_LEVELS } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DayData {
  day: string;
  mild: number;
  moderate: number;
  severe: number;
}

interface TrendsChartProps {
  symptoms: Symptom[];
}

export default function TrendsChart({ symptoms }: TrendsChartProps) {
  const [weekData, setWeekData] = useState<DayData[]>([]);

  useEffect(() => {
    if (!symptoms || symptoms.length === 0) {
      // Initialize empty week data
      const emptyWeekData = generateEmptyWeekData();
      setWeekData(emptyWeekData);
      return;
    }

    // Generate week data based on symptoms
    const weekDataArray = generateWeekData(symptoms);
    setWeekData(weekDataArray);
  }, [symptoms]);

  const generateEmptyWeekData = (): DayData[] => {
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(firstDayOfWeek, i);
      days.push({
        day: format(day, 'EEE'),
        mild: 0,
        moderate: 0,
        severe: 0
      });
    }

    return days;
  };

  const generateWeekData = (symptoms: Symptom[]): DayData[] => {
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(firstDayOfWeek, i);
      const dayStr = format(day, 'EEE');
      const dayFormat = format(day, 'yyyy-MM-dd');
      
      // Find symptoms for this day
      const daySymptoms = symptoms.filter(symptom => 
        format(new Date(symptom.date), 'yyyy-MM-dd') === dayFormat
      );
      
      // Count by severity
      const mild = daySymptoms.filter(s => s.severity <= SEVERITY_LEVELS.LOW.max).length;
      const moderate = daySymptoms.filter(s => 
        s.severity > SEVERITY_LEVELS.LOW.max && s.severity <= SEVERITY_LEVELS.MEDIUM.max
      ).length;
      const severe = daySymptoms.filter(s => s.severity > SEVERITY_LEVELS.MEDIUM.max).length;
      
      days.push({
        day: dayStr,
        mild,
        moderate,
        severe
      });
    }

    return days;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Symptom Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative" role="figure" aria-labelledby="trends-chart-title" aria-describedby="trends-chart-desc">
          <h3 id="trends-chart-title" className="sr-only">Weekly symptom severity trends</h3>
          <p id="trends-chart-desc" className="sr-only">Bar chart showing mild, moderate, and severe symptoms for each day of the week</p>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 relative" role="graphics-document" aria-roledescription="bar chart">
            {weekData.map((day, index) => (
              <div key={index} className="flex flex-col items-center" role="graphics-symbol" aria-roledescription="day column">
                <div className="flex flex-col space-y-1 items-center">
                  <div 
                    className="chart-bar w-8 bg-green-500 rounded-t-sm transition-all duration-500" 
                    style={{ height: `${day.mild * 10}%` }}
                    role="graphics-symbol"
                    aria-label={`${day.mild} mild symptoms on ${day.day}`}
                    aria-roledescription="mild symptoms bar"
                  ></div>
                  <div 
                    className="chart-bar w-8 bg-yellow-500 rounded-t-sm transition-all duration-500" 
                    style={{ height: `${day.moderate * 10}%` }}
                    role="graphics-symbol"
                    aria-label={`${day.moderate} moderate symptoms on ${day.day}`}
                    aria-roledescription="moderate symptoms bar"
                  ></div>
                  <div 
                    className="chart-bar w-8 bg-red-500 rounded-t-sm transition-all duration-500" 
                    style={{ height: `${day.severe * 10}%` }}
                    role="graphics-symbol"
                    aria-label={`${day.severe} severe symptoms on ${day.day}`}
                    aria-roledescription="severe symptoms bar"
                  ></div>
                </div>
                <span className="text-xs mt-2 text-gray-500 dark:text-gray-400" aria-hidden="true">{day.day}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center mt-4 space-x-6" role="list" aria-label="Chart legend">
            <div className="flex items-center" role="listitem">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-2" aria-hidden="true"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Mild</span>
            </div>
            <div className="flex items-center" role="listitem">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2" aria-hidden="true"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Moderate</span>
            </div>
            <div className="flex items-center" role="listitem">
              <div className="w-3 h-3 bg-red-500 rounded-sm mr-2" aria-hidden="true"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Severe</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
