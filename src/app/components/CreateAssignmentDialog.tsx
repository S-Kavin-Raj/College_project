import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface CreateAssignmentDialogProps {
  onClose: () => void;
  onSuccess?: () => void;
  filters: {
    department: string;
    year: number;
    section: string;
    semester: number;
    subject: string;
  };
}

export function CreateAssignmentDialog({
  onClose,
  onSuccess,
  filters,
}: CreateAssignmentDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    subject: filters.subject !== "All Subjects" ? filters.subject : "",
    description: "",
    deadline: "",
    maxMarks: 100,
  });
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('dam_token');
        const res = await fetch('/classes', { headers: { 'Authorization': token || '' } });
        if (res.ok) setClasses(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('dam_token');

      // Map year number back to label for class matching
      const yearMap: any = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
      const selectedYearLabel = yearMap[filters.year];

      const targetClass = classes.find(c => {
        const name = c.class_name.toLowerCase();
        const yearMatch = name.includes(selectedYearLabel.toLowerCase());
        const sectionMatch = name.includes(filters.section.toLowerCase());
        return yearMatch && sectionMatch;
      });

      if (!targetClass) {
        alert("Target class not found for selected filters.");
        setLoading(false);
        return;
      }

      const res = await fetch('/assignments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          class_id: targetClass.id,
          title: formData.title,
          description: formData.description,
          due_date: formData.deadline,
          subject: formData.subject, // Backend should probably save this too
          max_marks: formData.maxMarks
        })
      });

      if (res.ok) {
        alert("Assignment created successfully!");
        if (onSuccess) onSuccess();
        else onClose();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Network error creating assignment");
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Target: {filters.department} - Year {filters.year} (Section {filters.section})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1"
              placeholder="e.g. Distributed Systems"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="maxMarks">Maximum Marks *</Label>
              <Input
                id="maxMarks"
                type="number"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating..." : <><Plus className="w-4 h-4 mr-2" /> Create Assignment</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
