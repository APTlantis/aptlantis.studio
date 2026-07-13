import { useEffect, useState } from "react";
import {
  fetchDistributions,
  fetchDistributionById,
  type Distribution,
  type DataSource,
} from "../api/distributions";

export function useDistributions(params?: { q?: string; tag?: string }) {
  const query = params?.q;
  const tag = params?.tag;
  const [items, setItems] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<DataSource>("api");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchDistributions(query || tag ? { q: query, tag } : undefined)
      .then(({ items, source }) => {
        if (!mounted) return;
        setItems(items);
        setSource(source);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(
          e instanceof Error ? e : new Error("Failed to load distributions"),
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [query, tag]);

  return { items, loading, error, source };
}

export function useDistribution(id?: string) {
  const [item, setItem] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<DataSource>("api");

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchDistributionById(id)
      .then(({ item, source }) => {
        if (!mounted) return;
        setItem(item);
        setSource(source);
        if (!item) setError(new Error("Distribution not found"));
      })
      .catch((e) => {
        if (!mounted) return;
        setError(
          e instanceof Error ? e : new Error("Failed to load distribution"),
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return { item, loading, error, source };
}
