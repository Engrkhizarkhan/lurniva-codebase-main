import { useEffect, useState } from "react";
import { authFetch } from "~/shared/lib/api-client";
import type { CatalogSubject, CatalogSubjectDto } from "../create-plan-types";
import { getSubjectIcon } from "../lib/subject-icons";

export type CatalogStatus = "loading" | "ready" | "error";

export interface UseCatalogResult {
  subjects: CatalogSubject[];
  status: CatalogStatus;
  refetch: () => void;
}

function withIcons(subjects: CatalogSubjectDto[]): CatalogSubject[] {
  return subjects.map((subject) => ({
    ...subject,
    icon: getSubjectIcon(subject.label),
  }));
}

interface LoadedState {
  reloadToken: number;
  /** null means the fetch for this reloadToken failed. */
  subjects: CatalogSubject[] | null;
}

export function useCatalog(): UseCatalogResult {
  const [reloadToken, setReloadToken] = useState(0);
  const [loaded, setLoaded] = useState<LoadedState | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch<CatalogSubjectDto[]>("/api/catalog")
      .then((result) => {
        if (cancelled) return;
        setLoaded({
          reloadToken,
          subjects: result.success ? withIcons(result.data) : null,
        });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ reloadToken, subjects: null });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const isCurrent = loaded?.reloadToken === reloadToken;
  const subjects = isCurrent ? loaded.subjects : undefined;
  const status: CatalogStatus =
    subjects === undefined ? "loading" : subjects === null ? "error" : "ready";

  return {
    subjects: subjects ?? [],
    status,
    refetch: () => setReloadToken((token) => token + 1),
  };
}
