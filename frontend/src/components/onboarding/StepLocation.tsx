import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface StepLocationProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const StepLocation = ({ data, onChange }: StepLocationProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            placeholder="e.g. 123 Main Street"
            value={data.street || ""}
            onChange={(e) => onChange("street", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="e.g. Ho Chi Minh City"
            value={data.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input
            id="state"
            placeholder="e.g. HCMC"
            value={data.state || ""}
            onChange={(e) => onChange("state", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">Zip / Postal Code</Label>
          <Input
            id="zip"
            placeholder="e.g. 700000"
            value={data.zip || ""}
            onChange={(e) => onChange("zip", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            placeholder="e.g. Vietnam"
            value={data.country || ""}
            onChange={(e) => onChange("country", e.target.value)}
          />
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Map preview will appear here</p>
          <p className="text-xs text-muted-foreground">Enter your address above to see location</p>
        </div>
      </div>
    </div>
  );
};

export default StepLocation;
