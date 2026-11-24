"use client";

import { 
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function ChartsSection({ timeSeries }: { timeSeries: any[] }) {
  if (!timeSeries || timeSeries.length === 0) return null;

  const formatXAxis = (tickItem: string) => {
    try {
      return format(parseISO(tickItem), 'dd MMM', { locale: fr });
    } catch {
      return tickItem;
    }
  };

  const formatCurrency = (value: number) => `DZD ${value.toLocaleString()}`;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 1. Revenue & Profit (Smooth Line) */}
      <Card>
        <CardHeader>
          <CardTitle>Chiffre d'affaires & Bénéfice</CardTitle>
          <CardDescription>Évolution des revenus et des bénéfices nets dans le temps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), ""]} 
                  labelFormatter={(label) => formatXAxis(label as string)}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Chiffre d'affaires" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Bénéfice Net" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Marketing vs Revenue (Composed) */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses Marketing vs CA</CardTitle>
          <CardDescription>Comparaison du budget publicitaire par rapport aux revenus générés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis yAxisId="left" tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), ""]} 
                  labelFormatter={(label) => formatXAxis(label as string)}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="marketing_spend" name="Budget Pub" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Chiffre d'affaires" stroke="#10b981" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Orders Volume (Bar) */}
      <Card>
        <CardHeader>
          <CardTitle>Volume des Commandes</CardTitle>
          <CardDescription>Nombre de commandes reçues chaque jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(label) => formatXAxis(label as string)} />
                <Legend />
                <Bar dataKey="orders" name="Total Commandes" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="delivered_count" name="Livrées" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. Delivery & Confirmation Rates (Line) */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de Performance & ROAS</CardTitle>
          <CardDescription>Taux de confirmation, livraison et rentabilité (ROAS)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis yAxisId="left" domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [name === 'ROAS' ? `${Number(value || 0).toFixed(2)}x` : `${Number(value || 0).toFixed(1)}%`, name]} 
                  labelFormatter={(label) => formatXAxis(label as string)}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="confirmation_rate" name="Confirmation (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="delivery_rate" name="Livraison (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
