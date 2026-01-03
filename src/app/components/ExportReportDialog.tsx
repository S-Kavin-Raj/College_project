import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Card } from "./ui/card";
import type { Assignment } from "../App";
import { generateSubmissions } from "../data/mockData";

interface ExportReportDialogProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export function ExportReportDialog({
  assignment,
  onClose,
}: ExportReportDialogProps) {
  if (!assignment) return null;

  const submissions = generateSubmissions(assignment.id);
  
  const handleExport = (format: "pdf" | "excel") => {
    // In a real app, this would generate and download the report
    console.log(`Exporting ${format} report for assignment:`, assignment.id);
    
    // Simulate download
    alert(
      `Downloading ${format.toUpperCase()} report for "${assignment.title}"\n\n` +
      `This would include:\n` +
      `- Assignment details\n` +
      `- ${submissions.length} student submissions\n` +
      `- Marks and remarks\n` +
      `- Submission statistics`
    );
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Assignment Report</DialogTitle>
          <DialogDescription>
            Choose a format to export the assignment report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">{assignment.title}</h4>
            <p className="text-sm text-gray-600">{assignment.subject}</p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total Students: <span className="font-medium">{submissions.length}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Card
              className="p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => handleExport("pdf")}
            >
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <FileDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Export as PDF</h4>
                  <p className="text-sm text-gray-600">
                    Formatted PDF report with assignment details, marks, and statistics
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={() => handleExport("excel")}
            >
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Export as Excel (.xlsx)</h4>
                  <p className="text-sm text-gray-600">
                    Spreadsheet format for further analysis and data processing
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Report will include:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
              <li>Assignment-wise marks</li>
              <li>Submission status for all students</li>
              <li>Late submission summary</li>
              <li>Evaluation remarks</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
