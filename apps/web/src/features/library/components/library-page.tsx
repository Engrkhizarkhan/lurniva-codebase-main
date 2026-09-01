import { useState } from "react";
import { Library, Plus } from "lucide-react";
import { Button, cn } from "@lurniva/ui";
import type { SelectOption } from "@lurniva/ui";
import type { LibraryScope, LibraryStatus } from "@lurniva/validation";
import { EmptyState } from "~/shared/components/empty-state";
import { ErrorState } from "~/shared/components/error-state";
import { ListFooter } from "~/shared/components/list-footer";
import { ListToolbar } from "~/shared/components/list-toolbar";
import { useDebouncedValue } from "~/shared/hooks/useDebouncedValue";
import { useInfiniteScroll } from "~/shared/hooks/useInfiniteScroll";
import { AddContentDialog } from "./add-content-dialog";
import { LibraryCardSkeleton } from "./library-card-skeleton";
import { LibraryItemCard } from "./library-item-card";
import { UploadQueuePanel } from "./upload-queue-panel";
import { useLibraryActions } from "../hooks/useLibraryActions";
import { useLibraryFeed } from "../hooks/useLibraryFeed";
import { useLibraryUpload } from "../hooks/useLibraryUpload";
import type { AddLibraryContentInput } from "../types";

const TABS: { value: LibraryScope; label: string }[] = [
  { value: "lurniva", label: "Lurniva" },
  { value: "personal", label: "My content" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All statuses" },
  { value: "ready", label: "Ready" },
  { value: "processing", label: "Processing" },
  { value: "raw", label: "Not processed" },
  { value: "failed", label: "Failed" },
];

const SKELETON_KEYS = ["a", "b", "c", "d"] as const;

export function LibraryPage() {
  const [scope, setScope] = useState<LibraryScope>("lurniva");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LibraryStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const { removeContent, reprocessContent } = useLibraryActions();
  const upload = useLibraryUpload();

  const {
    items,
    total,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLibraryFeed({
    scope,
    q: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  });

  const sentinelRef = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: () => void fetchNextPage(),
  });

  const isFiltered = debouncedSearch.length > 0 || status !== "all";
  const busyId = reprocessContent.isPending
    ? reprocessContent.variables
    : removeContent.isPending
      ? removeContent.variables
      : undefined;

  function handleAdd(inputs: AddLibraryContentInput[]) {
    inputs.forEach((input) => upload.enqueue(input));
    // Uploads always land in the user's own content, so show them arriving.
    setScope("personal");
    setStatus("all");
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-text-heading md:text-3xl">
            Library
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-text-muted">
            Study material you can attach to a plan. Lurniva content is provided
            by the platform; add your own PDFs, Word documents or notes and
            they&apos;re distilled into chapters for study, chat and assessment.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} icon={<Plus size={16} />}>
          Add content
        </Button>
      </header>

      <div
        role="tablist"
        aria-label="Library source"
        className="flex gap-7 border-b border-border-subtle"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={scope === tab.value}
            onClick={() => setScope(tab.value)}
            className={cn(
              "-mb-px border-b-2 px-0.5 pb-3 text-[15px] transition-colors",
              scope === tab.value
                ? "border-primary font-semibold text-text-heading"
                : "border-transparent font-medium text-text-muted hover:text-text-body",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <UploadQueuePanel
        tasks={upload.tasks}
        onRetry={upload.retry}
        onDismiss={upload.dismiss}
        onClearFinished={upload.clearSettled}
      />

      <ListToolbar
        searchValue={search}
        searchLabel="Search library"
        searchPlaceholder="Search by title or file name…"
        onSearchChange={setSearch}
        filter={{
          label: "Filter by status",
          value: status,
          options: STATUS_OPTIONS,
          onChange: (value) => setStatus(value as LibraryStatus | "all"),
        }}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <LibraryCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="We couldn't load your library"
          description="Something went wrong on our side. Nothing has been lost — try again."
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Library size={22} />}
          title={
            isFiltered
              ? "Nothing matches those filters"
              : scope === "lurniva"
                ? "No platform content yet"
                : "Your library is empty"
          }
          description={
            isFiltered
              ? "Try a different search term or clear the status filter."
              : scope === "lurniva"
                ? "Platform study outlines will appear here once they're published."
                : "Upload a PDF, Word document or your notes to start studying, chatting and quizzing on your own material."
          }
          actionLabel={
            isFiltered
              ? "Clear filters"
              : scope === "personal"
                ? "Upload content"
                : undefined
          }
          onAction={
            isFiltered
              ? clearFilters
              : scope === "personal"
                ? () => setDialogOpen(true)
                : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                busy={busyId === item.id}
                onRemove={(itemId) => removeContent.mutate(itemId)}
                onReprocess={(itemId) => reprocessContent.mutate(itemId)}
              />
            ))}
            {isFetchingNextPage
              ? SKELETON_KEYS.slice(0, 3).map((key) => (
                  <LibraryCardSkeleton key={`next-${key}`} />
                ))
              : null}
          </div>

          <div ref={sentinelRef} aria-hidden="true" />

          <ListFooter
            loadedCount={items.length}
            total={total}
            noun="item"
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </>
      )}

      {dialogOpen ? (
        <AddContentDialog
          onClose={() => setDialogOpen(false)}
          onAdd={handleAdd}
        />
      ) : null}
    </div>
  );
}
