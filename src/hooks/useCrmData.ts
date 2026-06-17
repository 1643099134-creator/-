import { useState, useEffect, useCallback } from "react";
import { customersData, calculateCrmStats, type CrmStats, type Customer } from "@/lib/crmData";

// 10分钟 = 600000毫秒
const REFRESH_INTERVAL = 10 * 60 * 1000;

export function useCrmData() {
  const [customers, setCustomers] = useState<Customer[]>(customersData);
  const [stats, setStats] = useState<CrmStats>(() => calculateCrmStats(customersData));
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 刷新数据函数
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 模拟从外部源获取数据
      // 实际应用中这里会调用API获取最新数据
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 重新计算统计数据
      const newStats = calculateCrmStats(customers);
      setStats(newStats);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [customers]);

  // 初始加载和定时刷新
  useEffect(() => {
    // 初始加载
    refreshData();

    // 每10分钟自动刷新
    const intervalId = setInterval(() => {
      refreshData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  return {
    customers,
    stats,
    isLoading,
    lastUpdated,
    refreshData,
  };
}
