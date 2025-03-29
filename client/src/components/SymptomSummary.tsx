import { useEffect, useState } from 'react';
import { 
  Check, 
  AlertTriangle, 
  AlertCircle 
} from 'lucide-react';
import { Symptom, SEVERITY_LEVELS } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';

interface SymptomSummaryProps {
  symptoms: Symptom[];
}

export default function SymptomSummary({ symptoms }: SymptomSummaryProps) {
  const [summaryData, setSummaryData] = useState({
    mild: 0,
    moderate: 0,
    severe: 0
  });

  useEffect(() => {
    if (!symptoms || symptoms.length === 0) {
      setSummaryData({ mild: 0, moderate: 0, severe: 0 });
      return;
    }

    // Get symptoms from the last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSymptoms = symptoms.filter(s => new Date(s.date) >= oneWeekAgo);
    
    // Count by severity
    const mild = recentSymptoms.filter(s => s.severity <= SEVERITY_LEVELS.LOW.max).length;
    const moderate = recentSymptoms.filter(s => 
      s.severity > SEVERITY_LEVELS.LOW.max && s.severity <= SEVERITY_LEVELS.MEDIUM.max
    ).length;
    const severe = recentSymptoms.filter(s => s.severity > SEVERITY_LEVELS.MEDIUM.max).length;
    
    setSummaryData({ mild, moderate, severe });
  }, [symptoms]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">Recent Symptoms Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mild Symptoms</p>
              <p className="text-2xl font-semibold">{summaryData.mild}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5 flex items-center">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Moderate Symptoms</p>
              <p className="text-2xl font-semibold">{summaryData.moderate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5 flex items-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Severe Symptoms</p>
              <p className="text-2xl font-semibold">{summaryData.severe}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
