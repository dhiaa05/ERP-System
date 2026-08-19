'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, CreditCard, DollarSign, Users, Package, TrendingUp, TrendingDown, Target, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/dashboard', { 
        params: { start_date: startDate, end_date: endDate } 
      });
      return res.data.data;
    },
  });

  const { data: intelligence, refetch: refetchIntelligence } = useQuery({
    queryKey: ['intelligence'],
    queryFn: async () => {
      const res = await api.get('/intelligence');
      return res.data.data;
    },
  });

  const handleDismissAlert = async (alertId: number) => {
    await api.post(`/intelligence/alerts/${alertId}/dismiss`);
    refetchIntelligence();
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center">Chargement des KPIs...</div>;
  }

  const kpis = data;
  const activeAlerts = intelligence?.alerts || [];
  const insights = intelligence?.insights || [];

  // Placeholder chart data until we implement daily aggregation endpoint
  const chartData = [
    { date: '01 Jul', revenue: 4000, profit: 2400 },
    { date: '05 Jul', revenue: 3000, profit: 1398 },
    { date: '10 Jul', revenue: 2000, profit: 9800 },
    { date: '15 Jul', revenue: 2780, profit: 3908 },
    { date: '20 Jul', revenue: 1890, profit: 4800 },
    { date: '25 Jul', revenue: 2390, profit: 3800 },
    { date: '30 Jul', revenue: 3490, profit: 4300 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ALERTS BANNER */}
      {activeAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {activeAlerts.map((alert: any) => (
            <div key={alert.id} className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5" />
                <div>
                  <p className="font-bold">{alert.title}</p>
                  <p className="text-sm">{alert.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDismissAlert(alert.id)} className="border-destructive text-destructive hover:bg-destructive hover:text-white">
                Compris (Ignorer)
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
          <p className="text-muted-foreground">Aperçu financier et analytique de votre activité.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="border-0 h-9 bg-transparent"
          />
          <span className="text-muted-foreground">à</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="border-0 h-9 bg-transparent"
          />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis?.overview?.net_profit?.toLocaleString() || 0} DZD</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Chiffre d'affaires - Tous les coûts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.overview?.revenue?.toLocaleString() || 0} DZD</div>
            <p className="text-xs text-muted-foreground mt-1">Commandes livrées uniquement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpis?.overview?.roas || 0}x</div>
            <p className="text-xs text-muted-foreground mt-1">Retour sur investissement Meta</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPA Moyen</CardTitle>
            <Target className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{kpis?.overview?.cpa || 0} DZD</div>
            <p className="text-xs text-muted-foreground mt-1">Coût d'acquisition d'une commande livrée</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Évolution Financière</CardTitle>
            <CardDescription>Revenus vs Bénéfice Net (Données Simulées pour Démo)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Chiffre d'Affaires" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Bénéfice Net" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Structure des Coûts</CardTitle>
            <CardDescription>Analyse détaillée des marges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full"><CreditCard className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Chiffre d'Affaires (Revenus)</p>
                  </div>
                </div>
                <div className="font-bold">{kpis?.overview?.revenue?.toLocaleString() || 0} DZD</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-destructive/10 rounded-full"><Package className="h-4 w-4 text-destructive" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Coût des Produits (COGS)</p>
                  </div>
                </div>
                <div className="font-bold text-destructive">-{kpis?.financials?.cogs?.toLocaleString() || 0} DZD</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-destructive/10 rounded-full"><Activity className="h-4 w-4 text-destructive" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Frais de Livraison</p>
                  </div>
                </div>
                <div className="font-bold text-destructive">-{kpis?.financials?.shipping?.toLocaleString() || 0} DZD</div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full"><TrendingUp className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Bénéfice Brut (Gross Profit)</p>
                  </div>
                </div>
                <div className="font-bold">{kpis?.financials?.gross_profit?.toLocaleString() || 0} DZD</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-destructive/10 rounded-full"><Activity className="h-4 w-4 text-destructive" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Dépenses Meta Ads</p>
                  </div>
                </div>
                <div className="font-bold text-destructive">-{kpis?.financials?.marketing_spend?.toLocaleString() || 0} DZD</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-destructive/10 rounded-full"><Users className="h-4 w-4 text-destructive" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Coûts Fixes (Overheads)</p>
                  </div>
                </div>
                <div className="font-bold text-destructive">-{kpis?.financials?.overheads?.toLocaleString() || 0} DZD</div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-full"><DollarSign className="h-4 w-4 text-green-500" /></div>
                  <div>
                    <p className="text-sm font-medium leading-none">Bénéfice Net</p>
                  </div>
                </div>
                <div className="font-bold text-green-600 text-xl">{kpis?.overview?.net_profit?.toLocaleString() || 0} DZD</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics & Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 lg:col-span-3 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.orders?.delivery_rate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">{kpis?.orders?.delivered} commandes livrées sur {kpis?.orders?.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads Générés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.marketing?.leads || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Via Meta Ads</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CPL (Coût par Lead)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.marketing?.cpl || 0} DZD</div>
              <p className="text-xs text-muted-foreground mt-1">Dépense publicitaire / Leads totaux</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        <Card className="col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5" /> Centre d'Intelligence
            </CardTitle>
            <CardDescription>Observations automatisées du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucune observation pour le moment.</p>
            ) : (
              insights.map((insight: any) => (
                <div key={insight.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                  {insight.text}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
