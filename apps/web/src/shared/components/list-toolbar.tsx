import { Search } from "lucide-react";
import { Input, Select } from "@lurniva/ui";
import type { SelectOption } from "@lurniva/ui";

export interface ListToolbarFilter {
  /** Screen-reader label — the control itself shows only the current value. */
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface ListToolbarProps {
  searchValue: string;
  searchPlaceholder: string;
  searchLabel: string;
  onSearchChange: (value: string) => void;
  filter?: ListToolbarFilter;
}

/** The search + filter row above a paged list (library, teachers). */
export function ListToolbar({
  searchValue,
  searchPlaceholder,
  searchLabel,
  onSearchChange,
  filter,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <Input
          type="search"
          value={searchValue}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          icon={<Search size={16} />}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      {filter ? (
        <Select
          className="sm:w-50"
          aria-label={filter.label}
          value={filter.value}
          options={filter.options}
          onChange={(event) => filter.onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
