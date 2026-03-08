import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DaySchedule {
  open: boolean;
  from: string;
  to: string;
}

interface StepHoursProps {
  data: Record<string, DaySchedule>;
  onChange: (field: string, value: DaySchedule) => void;
}

const defaultSchedule: Record<string, DaySchedule> = Object.fromEntries(
  DAYS.map((d) => [
    d,
    {
      open: d !== "Sunday",
      from: "09:00",
      to: d === "Saturday" ? "23:00" : "22:00",
    },
  ])
);

const StepHours = ({ data, onChange }: StepHoursProps) => {
  const schedule = { ...defaultSchedule, ...data };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Configure operating hours for each day of the week.</p>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const s = schedule[day];
          return (
            <div
              key={day}
              className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3"
            >
              <div className="w-28 shrink-0">
                <span className="text-sm font-medium text-foreground">{day}</span>
              </div>
              <Switch
                checked={s.open}
                onCheckedChange={(checked) =>
                  onChange(day, { ...s, open: checked })
                }
              />
              <span className="text-xs text-muted-foreground w-12">
                {s.open ? "Open" : "Closed"}
              </span>
              {s.open && (
                <div className="flex items-center gap-2 ml-auto">
                  <Input
                    type="time"
                    className="w-32 h-9 text-sm"
                    value={s.from}
                    onChange={(e) => onChange(day, { ...s, from: e.target.value })}
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    className="w-32 h-9 text-sm"
                    value={s.to}
                    onChange={(e) => onChange(day, { ...s, to: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepHours;
