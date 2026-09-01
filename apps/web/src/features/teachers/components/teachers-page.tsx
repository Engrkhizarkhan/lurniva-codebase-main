import { useState } from "react";
import { Presentation } from "lucide-react";
import type { SelectOption } from "@lurniva/ui";
import { EmptyState } from "~/shared/components/empty-state";
import { ErrorState } from "~/shared/components/error-state";
import { ListFooter } from "~/shared/components/list-footer";
import { ListToolbar } from "~/shared/components/list-toolbar";
import { useDebouncedValue } from "~/shared/hooks/useDebouncedValue";
import { useInfiniteScroll } from "~/shared/hooks/useInfiniteScroll";
import { TeacherCard } from "./teacher-card";
import { TeacherCardSkeleton } from "./teacher-card-skeleton";
import { useTeachers } from "../hooks/useTeachers";
import type { TeacherAvailability } from "../types";

type AvailabilityFilter = TeacherAvailability | "all";

const AVAILABILITY_OPTIONS: SelectOption[] = [
  { value: "all", label: "All availability" },
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited" },
  { value: "full", label: "Full" },
];

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

function TeacherGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

export function TeachersPage() {
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const debouncedSearch = useDebouncedValue(search);

  const {
    teachers,
    total,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTeachers({
    q: debouncedSearch || undefined,
    availability: availability === "all" ? undefined : availability,
  });

  const sentinelRef = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: () => void fetchNextPage(),
  });

  const isFiltered = debouncedSearch.length > 0 || availability !== "all";

  function clearFilters() {
    setSearch("");
    setAvailability("all");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-text-heading md:text-3xl">
          Teachers
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-text-muted">
          Browse the teachers on Lurniva. Every listing shows what they teach,
          how they&apos;re rated by other students and their monthly fee.
        </p>
      </header>

      <ListToolbar
        searchValue={search}
        searchLabel="Search teachers"
        searchPlaceholder="Search by name or subject…"
        onSearchChange={setSearch}
        filter={{
          label: "Filter by availability",
          value: availability,
          options: AVAILABILITY_OPTIONS,
          onChange: (value) => setAvailability(value as AvailabilityFilter),
        }}
      />

      {isLoading ? (
        <TeacherGrid>
          {SKELETON_KEYS.map((key) => (
            <TeacherCardSkeleton key={key} />
          ))}
        </TeacherGrid>
      ) : isError ? (
        <ErrorState
          title="We couldn't load the teachers"
          description="Something went wrong on our side. Your filters are still here — try again."
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={<Presentation size={22} />}
          title={
            isFiltered ? "No teachers match those filters" : "No teachers yet"
          }
          description={
            isFiltered
              ? "Try a different subject or widen the availability filter."
              : "Teacher listings will appear here as they join the platform."
          }
          actionLabel={isFiltered ? "Clear filters" : undefined}
          onAction={isFiltered ? clearFilters : undefined}
        />
      ) : (
        <>
          <TeacherGrid>
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
            {isFetchingNextPage
              ? SKELETON_KEYS.slice(0, 3).map((key) => (
                  <TeacherCardSkeleton key={`next-${key}`} />
                ))
              : null}
          </TeacherGrid>

          <div ref={sentinelRef} aria-hidden="true" />

          <ListFooter
            loadedCount={teachers.length}
            total={total}
            noun="teacher"
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </>
      )}
    </div>
  );
}
