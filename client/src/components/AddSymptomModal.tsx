import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Trigger } from '@shared/schema';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AddSymptomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSymptom?: string;
}

export default function AddSymptomModal({ 
  open, 
  onOpenChange,
  initialSymptom
}: AddSymptomModalProps) {
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState('');
  const [durationType, setDurationType] = useState('hours');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [offlineMode] = useLocalStorage('offlineMode', true);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (initialSymptom) {
        setName(initialSymptom);
      }
    } else {
      resetForm();
    }
  }, [open, initialSymptom]);

  const resetForm = () => {
    setName('');
    setSeverity(5);
    setDuration('');
    setDurationType('hours');
    setSelectedTriggers([]);
    setTriggerInput('');
    setNotes('');
  };

  // Fetch triggers
  const { data: triggers = [] } = useQuery<Trigger[]>({
    queryKey: ['/api/triggers'],
  });

  // Add a new symptom
  const addSymptomMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/symptoms', data);
    },
    onSuccess: () => {
      onOpenChange(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/symptoms'] });
      toast({
        title: "Symptom added",
        description: "Your symptom has been logged successfully.",
      });
    },
    onError: (error) => {
      console.error("Error adding symptom:", error);
      toast({
        title: "Error",
        description: "Failed to add symptom. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add a new trigger
  const addTriggerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/triggers', data);
    },
    onSuccess: (_, variables) => {
      setTriggerInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/triggers'] });
      if (!selectedTriggers.includes(variables.name)) {
        setSelectedTriggers([...selectedTriggers, variables.name]);
      }
    },
    onError: (error) => {
      console.error("Error adding trigger:", error);
      toast({
        title: "Error",
        description: "Failed to add trigger. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addTrigger = () => {
    if (!triggerInput.trim()) return;
    
    // Check if trigger is already in available triggers
    const existingTrigger = triggers.find(t => 
      t.name.toLowerCase() === triggerInput.trim().toLowerCase()
    );
    
    if (existingTrigger) {
      // If it exists but is not selected, add it to selected triggers
      if (!selectedTriggers.includes(existingTrigger.name)) {
        setSelectedTriggers([...selectedTriggers, existingTrigger.name]);
      }
      setTriggerInput('');
    } else {
      // Otherwise, create a new trigger
      addTriggerMutation.mutate({ name: triggerInput.trim() });
    }
  };

  const removeTrigger = (trigger: string) => {
    setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Symptom name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid duration",
        variant: "destructive",
      });
      return;
    }

    const symptomData = {
      name: name.trim(),
      severity,
      duration: Number(duration),
      durationType,
      triggers: selectedTriggers,
      notes: notes.trim(),
      date: new Date().toISOString()
    };

    // Store locally if offline mode is enabled
    if (offlineMode) {
      try {
        // Get existing symptoms from local storage
        const localSymptoms = localStorage.getItem('symptoms');
        const symptoms = localSymptoms ? JSON.parse(localSymptoms) : [];
        
        // Add new symptom with a temporary ID
        const newSymptom = {
          ...symptomData,
          id: Date.now(), // Use timestamp as temporary ID
        };
        
        symptoms.push(newSymptom);
        localStorage.setItem('symptoms', JSON.stringify(symptoms));
        
        onOpenChange(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['/api/symptoms'] });
        
        toast({
          title: "Symptom added (offline)",
          description: "Your symptom has been logged locally. It will be synced when you're online.",
        });
      } catch (error) {
        console.error("Error saving to local storage:", error);
        toast({
          title: "Error",
          description: "Failed to save symptom locally. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Submit to server
      addSymptomMutation.mutate(symptomData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-labelledby="symptom-dialog-title">
        <DialogHeader>
          <DialogTitle id="symptom-dialog-title">Log Symptom</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2" role="form" aria-label="Log symptom form">
          <div className="space-y-2">
            <Label htmlFor="symptom-name">Symptom</Label>
            <Input
              id="symptom-name"
              placeholder="e.g., Headache, Nausea, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-required="true"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="severity-slider">Severity ({severity}/10)</Label>
            <div className="flex items-center pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8" id="severity-min" aria-hidden="true">Low</span>
              <Slider
                id="severity-slider"
                value={[severity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setSeverity(value[0])}
                className="flex-1 mx-2"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={severity}
                aria-labelledby="severity-slider"
                aria-describedby="severity-min severity-max"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8" id="severity-max" aria-hidden="true">High</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration-type">Duration</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={durationType} onValueChange={setDurationType} name="duration-type">
                <SelectTrigger id="duration-type" aria-label="Duration type">
                  <SelectValue placeholder="Select duration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="duration-value"
                type="number"
                placeholder="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                aria-label={`Duration in ${durationType}`}
                aria-required="true"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trigger-input">Triggers (Optional)</Label>
            {selectedTriggers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Selected triggers">
                {selectedTriggers.map((trigger, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center">
                    {trigger}
                    <button
                      type="button"
                      className="ml-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => removeTrigger(trigger)}
                      aria-label={`Remove ${trigger}`}
                    >
                      <XCircle className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex">
              <Input
                id="trigger-input"
                placeholder="Add trigger"
                value={triggerInput}
                onChange={(e) => setTriggerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTrigger();
                  }
                }}
                aria-label="Trigger name"
              />
              <Button 
                variant="secondary" 
                className="ml-2 flex items-center justify-center" 
                onClick={addTrigger}
                disabled={!triggerInput.trim()}
                aria-label="Add trigger"
              >
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Additional details about this symptom..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="Additional notes"
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || !duration || isNaN(Number(duration)) || Number(duration) <= 0}
            aria-label="Save symptom"
          >
            Save Symptom
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
