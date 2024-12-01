import { Button } from "@/components/ui/button";

interface ComplaintFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function ComplaintFilters({ filter, onFilterChange }: ComplaintFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filter === "all" ? "default" : "outline"}
        onClick={() => onFilterChange("all")}
        size="sm"
      >
        All
      </Button>
      <Button
        variant={filter === "pending" ? "default" : "outline"}
        onClick={() => onFilterChange("pending")}
        size="sm"
      >
        Pending
      </Button>
      <Button
        variant={filter === "resolved" ? "default" : "outline"}
        onClick={() => onFilterChange("resolved")}
        size="sm"
      >
        Resolved
      </Button>
    </div>
  );
}