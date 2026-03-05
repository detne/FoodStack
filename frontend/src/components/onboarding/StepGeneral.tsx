import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, UserCircle } from "lucide-react";

interface StepGeneralProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const StepGeneral = ({ data, onChange }: StepGeneralProps) => {
  return (
    <div className="space-y-8">
      {/* Form Fields */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="branchName">Branch Name *</Label>
          <Input
            id="branchName"
            placeholder="e.g. Downtown Location"
            value={data.branchName || ""}
            onChange={(e) => onChange("branchName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branchCode">Branch Code *</Label>
          <Input
            id="branchCode"
            placeholder="e.g. DT-001"
            value={data.branchCode || ""}
            onChange={(e) => onChange("branchCode", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Primary Phone *</Label>
          <Input
            id="phone"
            placeholder="e.g. +84 123 456 789"
            value={data.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Public Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. info@restaurant.com"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>

      {/* Preview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Location Preview</span>
          </div>
          <p className="text-xs text-muted-foreground">Active in Step 2</p>
          <div className="mt-3 h-20 bg-muted rounded flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Map preview disabled</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Operating Hours</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Mon - Fri: 9:00 AM - 10:00 PM</p>
            <p>Saturday: 10:00 AM - 11:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Branch Manager</span>
          </div>
          <p className="text-xs text-muted-foreground">Unassigned</p>
          <p className="text-xs text-muted-foreground mt-1">Assign in Step 4</p>
        </div>
      </div>
    </div>
  );
};

export default StepGeneral;
