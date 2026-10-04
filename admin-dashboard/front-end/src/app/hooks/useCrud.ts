"use client";

import { useState } from "react";

type UseCrudOptions<T> = {
  endpoint: string;
  initialData: T[];
  getId: (item: T) => string | number;
};

export function useCrud<T>({
  endpoint,
  initialData,
  getId,
}: UseCrudOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(endpoint, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = (await response.json()) as T[];
      setItems(data);
    } catch {
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function create(data: unknown) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error();
      }

      await refresh();

      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function update(id: string | number, data: unknown) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error();
      }

      await refresh();

      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: T) {
    const id = getId(item);

    try {
      setError("");

      const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      setItems((current) =>
        current.filter((currentItem) => getId(currentItem) !== id),
      );

      return true;
    } catch {
      setError("Failed to delete item. Please try again.");
      return false;
    }
  }

  return {
    items,
    setItems,
    loading,
    saving,
    error,
    setError,
    refresh,
    create,
    update,
    remove,
  };
}
