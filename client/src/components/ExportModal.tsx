import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Table } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Symptom } from '@shared/schema';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const { toast } = useToast();
  
  // Fetch symptoms for PDF export
  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms'],
  });

  const handleExport = async () => {
    try {
      if (exportType === 'csv') {
        // Redirect to CSV download endpoint
        window.location.href = '/api/export/csv';
      } else if (exportType === 'pdf') {
        // Generate PDF with jsPDF
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Symptom Tracker - Export', 14, 22);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
        
        // Check if we have data
        if (symptoms.length === 0) {
          doc.text('No symptom data available to export.', 14, 50);
        } else {
          // Prepare table data
          const tableColumn = ["Date", "Symptom", "Severity", "Duration", "Triggers", "Notes"];
          const tableRows = symptoms.map(symptom => [
            new Date(symptom.date).toLocaleString(),
            symptom.name,
            `${symptom.severity}/10`,
            `${symptom.duration} ${symptom.durationType}`,
            Array.isArray(symptom.triggers) ? symptom.triggers.join(', ') : '',
            symptom.notes || ''
          ]);
          
          // Add the table
          (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 35 } },
            margin: { top: 40 },
          });
        }
        
        // Save the PDF
        doc.save('symptom_tracker_export.pdf');
      }
      
      onOpenChange(false);
      toast({
        title: "Export successful",
        description: `Your data has been exported as ${exportType.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Your Data</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label className="block mb-3">Choose export format:</Label>
          <RadioGroup value={exportType} onValueChange={(value: 'csv' | 'pdf') => setExportType(value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center cursor-pointer">
                <Table className="h-5 w-5 mr-2 text-blue-500" />
                CSV (Spreadsheet)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                <FileText className="h-5 w-5 mr-2 text-red-500" />
                PDF Document
              </Label>
            </div>
          </RadioGroup>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Export your symptom history to share with healthcare providers.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export {exportType.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
