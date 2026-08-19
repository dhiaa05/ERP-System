'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TopKpiCards } from './components/TopKpiCards';
import { CircularKpis } from './components/CircularKpis';
import { ChartsSection } from './components/ChartsSection';
import { RankingsSection } from './components/Rankings';
import { InsightsAlerts } from './components/InsightsAlerts';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const res = await api.get('/dashboard', { params: dateRange });
      return res.data?.data;
    },
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Dashboard</h2>
          <p className="text-muted-foreground">Suivi en temps réel de la santé de votre activité e-commerce.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
          <Input 
            type="date" 
            value={dateRange.start_date}
            onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <span className="text-muted-foreground">au</span>
          <Input 
            type="date" 
            value={dateRange.end_date}
            onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <TopKpiCards topKpis={data?.top_kpis} />
          <CircularKpis circularKpis={data?.circular_kpis} />
          <ChartsSection timeSeries={data?.time_series} />
          <RankingsSection rankings={data?.rankings} />
          <InsightsAlerts insights={data?.insights} />
        </>
      )}
    </div>
  );
}
