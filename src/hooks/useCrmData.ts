import { useState, useEffect, useCallback, useRef } from "react";
import { customersData, calculateCrmStats, type CrmStats, type Customer } from "@/lib/crmData";

const API_BASE = "/api";
const CRM_STORAGE_KEY = "customerData";

async function fetchCustomersFromAPI(): Promise<Customer[] | null> {
  try {
    const res = await fetch(`${API_BASE}/customers`);
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) return json.data as Customer[];
  } catch { /* API 不可用时回退 */ }
  return null;
}

function loadCustomersFromStorage(): Customer[] {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Customer[];
    }
  } catch { /* ignore */ }
  return customersData;
}

export function useCrmData() {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomersFromStorage);
  const [stats, setStats] = useState<CrmStats>(() => calculateCrmStats(loadCustomersFromStorage()));
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const esRef = useRef<EventSource | null>(null);

  const updateData = useCallback((data: Customer[]) => {
    setCustomers(data);
    setStats(calculateCrmStats(data));
    setLastUpdated(new Date());
    try { localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiData = await fetchCustomersFromAPI();
      updateData(apiData || loadCustomersFromStorage());
    } finally {
      setIsLoading(false);
    }
  }, [updateData]);

  // 1. 初始加载
  useEffect(() => { refreshData(); }, [refreshData]);

  // 2. SSE 实时监听
  useEffect(() => {
    const connectSSE = () => {
      const es = new EventSource(`${API_BASE}/events`);
      esRef.current = es;
      es.addEventListener("customers_updated", () => refreshData());
      es.onerror = () => { es.close(); setTimeout(connectSSE, 5000); };
    };
    connectSSE();
    return () => { esRef.current?.close(); };
  }, [refreshData]);

  // 3. 页面焦点刷新
  useEffect(() => {
    const h = () => refreshData();
    window.addEventListener("focus", h);
    return () => window.removeEventListener("focus", h);
  }, [refreshData]);

  // 4. 10分钟定时刷新
  useEffect(() => {
    const id = setInterval(refreshData, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshData]);

  return { customers, stats, isLoading, lastUpdated, refreshData };
}
