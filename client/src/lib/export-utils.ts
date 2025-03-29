import { Symptom } from '@shared/schema';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Converts an array of symptoms to a CSV string
 */
export function generateCSV(symptoms: Symptom[]): string {
  if (symptoms.length === 0) {
    return 'No data';
  }

  // Define headers
  const headers = ['ID', 'Symptom', 'Severity', 'Duration', 'Duration Type', 'Date', 'Triggers', 'Relief Methods', 'Relief Effectiveness', 'Notes'];
  
  // Format rows
  const rows = symptoms.map(symptom => [
    symptom.id,
    symptom.name,
    symptom.severity,
    symptom.duration,
    symptom.durationType,
    new Date(symptom.date).toLocaleString(),
    Array.isArray(symptom.triggers) ? symptom.triggers.join(', ') : '',
    Array.isArray(symptom.reliefMethods) ? symptom.reliefMethods.join(', ') : '',
    symptom.reliefEffectiveness || 'N/A',
    symptom.notes || ''
  ]);
  
  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csv;
}

/**
 * Generates a PDF document from symptoms data
 */
export function generatePDF(symptoms: Symptom[]): jsPDF {
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
    return doc;
  }
  
  // Prepare table data
  const tableColumn = ["Date", "Symptom", "Severity", "Duration", "Triggers", "Relief Methods", "Relief Effectiveness", "Notes"];
  const tableRows = symptoms.map(symptom => [
    new Date(symptom.date).toLocaleString(),
    symptom.name,
    `${symptom.severity}/10`,
    `${symptom.duration} ${symptom.durationType}`,
    Array.isArray(symptom.triggers) ? symptom.triggers.join(', ') : '',
    Array.isArray(symptom.reliefMethods) ? symptom.reliefMethods.join(', ') : '',
    symptom.reliefEffectiveness ? `${symptom.reliefEffectiveness}/10` : 'N/A',
    symptom.notes || ''
  ]);
  
  // Add the table
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 
      0: { cellWidth: 28 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15 },
      3: { cellWidth: 15 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 15 },
    },
    margin: { top: 40 },
  });
  
  return doc;
}

/**
 * Download the generated CSV data
 */
export function downloadCSV(symptoms: Symptom[]): void {
  const csv = generateCSV(symptoms);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'symptom_tracker_export.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download the generated PDF data
 */
export function downloadPDF(symptoms: Symptom[]): void {
  const doc = generatePDF(symptoms);
  doc.save('symptom_tracker_export.pdf');
}
