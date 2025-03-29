import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommonSymptom } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface QuickAddProps {
  onSymptomClick: (symptomName: string) => void;
}

export default function QuickAdd({ onSymptomClick }: QuickAddProps) {
  const [customSymptomName, setCustomSymptomName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch common symptoms
  const { data: commonSymptoms = [], refetch } = useQuery<CommonSymptom[]>({
    queryKey: ['/api/common-symptoms'],
  });

  const handleAddCustomSymptom = async () => {
    try {
      if (!customSymptomName.trim()) {
        toast({
          title: "Error",
          description: "Symptom name cannot be empty",
          variant: "destructive",
        });
        return;
      }

      await apiRequest('POST', '/api/common-symptoms', { 
        name: customSymptomName.trim() 
      });
      
      toast({
        title: "Symptom added",
        description: `"${customSymptomName}" has been added to your common symptoms`,
      });
      
      setCustomSymptomName('');
      setDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add custom symptom",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle id="quick-add-heading">Quick Add Symptom</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6"
          role="group"
          aria-labelledby="quick-add-heading"
        >
          {commonSymptoms.map((symptom) => (
            <button 
              key={symptom.id}
              className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-600 shadow-sm"
              onClick={() => onSymptomClick(symptom.name)}
              aria-label={`Add ${symptom.name} symptom`}
              role="button"
            >
              <span className="block text-center font-medium text-gray-900 dark:text-white">{symptom.name}</span>
            </button>
          ))}
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <div className="bg-primary bg-opacity-10 rounded-lg p-4 text-center">
              <Button 
                variant="secondary" 
                className="font-medium border border-primary"
                aria-label="Add custom symptom"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Add custom symptom
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent aria-labelledby="custom-symptom-dialog-title">
            <DialogHeader>
              <DialogTitle id="custom-symptom-dialog-title">Add Custom Symptom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Input
                  id="symptom-name-input"
                  placeholder="Enter symptom name"
                  value={customSymptomName}
                  onChange={(e) => setCustomSymptomName(e.target.value)}
                  aria-label="Symptom name"
                  aria-required="true"
                />
              </div>
              <Button 
                onClick={handleAddCustomSymptom}
                disabled={!customSymptomName.trim()}
                className="w-full"
                aria-label="Add custom symptom"
              >
                Add Symptom
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
