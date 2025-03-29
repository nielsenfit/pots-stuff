import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Symptom, SEVERITY_LEVELS } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Shield, 
  MessageSquare, 
  Link2 
} from 'lucide-react';
import { Link } from 'wouter';

interface RecentSymptomsProps {
  symptoms: Symptom[];
}

export default function RecentSymptoms({ symptoms }: RecentSymptomsProps) {
  // Sort symptoms by date (newest first) and take first 3
  const recentEntries = [...symptoms]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  // Get severity class
  const getSeverityClass = (severity: number) => {
    if (severity >= SEVERITY_LEVELS.HIGH.min) {
      return {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-600 dark:text-red-400',
        label: 'High'
      };
    } else if (severity >= SEVERITY_LEVELS.MEDIUM.min) {
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-600 dark:text-yellow-400',
        label: 'Medium'
      };
    } else {
      return {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400',
        label: 'Low'
      };
    }
  };

  // Format date for display
  const formatDate = (date: string) => {
    const symptomDate = new Date(date);
    if (isToday(symptomDate)) {
      return 'Today';
    } else if (isYesterday(symptomDate)) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(symptomDate, { addSuffix: true });
    }
  };

  // Get icon for symptom
  const getSymptomIcon = (symptom: string) => {
    switch (symptom.toLowerCase()) {
      case 'migraine':
      case 'headache':
        return <AlertCircle className="h-6 w-6" />;
      case 'nausea':
        return <Shield className="h-6 w-6" />;
      case 'fatigue':
        return <MessageSquare className="h-6 w-6" />;
      default:
        return <Link2 className="h-6 w-6" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Recent Entries</h3>
        <Link href="/history">
          <Button variant="link" className="text-primary text-sm">View all</Button>
        </Link>
      </div>
      
      <Card className="overflow-hidden">
        {recentEntries.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentEntries.map((entry) => {
              const severityClass = getSeverityClass(entry.severity);
              
              return (
                <li key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${severityClass.bg} ${severityClass.text}`}>
                          {getSymptomIcon(entry.name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{entry.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {severityClass.label} severity · {entry.duration} {entry.durationType}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(entry.date), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                  {entry.triggers && entry.triggers.length > 0 && (
                    <div className="mt-2">
                      {entry.triggers.map((trigger, i) => (
                        <Badge key={i} variant="secondary" className="mr-2 mb-1">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No symptoms recorded yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Start logging symptoms to see them here.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
