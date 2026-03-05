import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepManagerProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const StepManager = ({ data, onChange }: StepManagerProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="managerName">Manager Full Name *</Label>
          <Input
            id="managerName"
            placeholder="e.g. Nguyen Van A"
            value={data.managerName || ""}
            onChange={(e) => onChange("managerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="managerEmail">Manager Email *</Label>
          <Input
            id="managerEmail"
            type="email"
            placeholder="e.g. manager@restaurant.com"
            value={data.managerEmail || ""}
            onChange={(e) => onChange("managerEmail", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="managerPhone">Manager Phone *</Label>
          <Input
            id="managerPhone"
            placeholder="e.g. +84 987 654 321"
            value={data.managerPhone || ""}
            onChange={(e) => onChange("managerPhone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="managerRole">Role</Label>
          <Select
            value={data.managerRole || ""}
            onValueChange={(v) => onChange("managerRole", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="branch_manager">Branch Manager</SelectItem>
              <SelectItem value="area_manager">Area Manager</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-muted/50 p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">Setup Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Manager:</span>{" "}
            <span className="text-foreground">{data.managerName || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="text-foreground">{data.managerEmail || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>{" "}
            <span className="text-foreground">{data.managerPhone || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Role:</span>{" "}
            <span className="text-foreground">{data.managerRole || "Not set"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepManager;
