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
        <CardTitle>Quick Add Symptom</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {commonSymptoms.map((symptom) => (
            <div 
              key={symptom.id}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              onClick={() => onSymptomClick(symptom.name)}
            >
              <span className="block text-center font-medium">{symptom.name}</span>
            </div>
          ))}
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <div className="bg-primary bg-opacity-10 rounded-lg p-4 text-center">
              <Button variant="ghost" className="text-primary font-medium">
                <Plus className="w-4 h-4 mr-2" /> Add custom symptom
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Symptom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Input
                  placeholder="Enter symptom name"
                  value={customSymptomName}
                  onChange={(e) => setCustomSymptomName(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddCustomSymptom}
                disabled={!customSymptomName.trim()}
                className="w-full"
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
