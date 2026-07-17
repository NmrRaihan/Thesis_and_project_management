import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with keys: key (data key), label (display name)
 * @param {String} fileName - Name of the Excel file (without extension)
 */
export const exportToExcel = (data, headers, fileName) => {
  try {
    if (!data || data.length === 0) {
      toast.warning('No data to export');
      return;
    }

    // Prepare worksheet data with headers
    const worksheetData = [
      headers.map(h => h.label) // First row: headers
    ];

    // Add data rows
    data.forEach(item => {
      const row = headers.map(h => {
        const value = item[h.key];
        // Handle different data types
        if (value === null || value === undefined) return 'N/A';
        if (value instanceof Date) return value.toLocaleDateString();
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      worksheetData.push(row);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths automatically
    const colWidths = headers.map(h => ({
      wch: Math.max(h.label.length, 15) // Minimum 15 characters wide
    }));
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generate Excel file and trigger download
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${fileName}-${timestamp}.xlsx`);
    
    toast.success(`Exported ${data.length} records to Excel`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export to Excel');
  }
};

/**
 * Export data to CSV file (fallback option)
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with keys: key (data key), label (display name)
 * @param {String} fileName - Name of the CSV file (without extension)
 */
export const exportToCSV = (data, headers, fileName) => {
  try {
    if (!data || data.length === 0) {
      toast.warning('No data to export');
      return;
    }

    // Prepare CSV content
    const csvHeaders = headers.map(h => h.label);
    const csvRows = data.map(item => 
      headers.map(h => {
        const value = item[h.key];
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${fileName}-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${data.length} records to CSV`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    toast.error('Failed to export to CSV');
  }
};
