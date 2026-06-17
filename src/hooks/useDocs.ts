import { useState, useEffect } from "react";
import { docsApi } from "@/supabase/api";
import type { Customer } from "@/types";

export function useDocs() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const data = await docsApi.getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: fetchCustomers };
}
