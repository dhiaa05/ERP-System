"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RankingsSection({ rankings }: { rankings: any }) {
  if (!rankings) return null;

  // Helper to get max for progress bar
  const maxProductSales = Math.max(...(rankings.products?.map((p: any) => p.sales) || [0]), 1);
  const maxWilayaOrders = Math.max(...(rankings.wilayas?.map((w: any) => w.orders) || [0]), 1);
  const maxEmployeeConfs = Math.max(...(rankings.employees?.map((e: any) => e.confirmations) || [0]), 1);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 1. Product Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Top Produits (Ventes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.products?.map((product: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate pr-2" title={product.name}>{product.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">{product.sales} ventes</span>
                </div>
                <Progress value={(product.sales / maxProductSales) * 100} className="h-2 bg-indigo-100 dark:bg-indigo-950" indicatorColor="bg-indigo-500" />
              </div>
            ))}
            {rankings.products?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Wilaya Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Top Wilayas (Commandes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.wilayas?.map((wilaya: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate pr-2">{wilaya.name}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground whitespace-nowrap">{wilaya.orders} cmds</span>
                    <span className="text-[10px] text-emerald-500">{wilaya.delivery_rate}% livrées</span>
                  </div>
                </div>
                <Progress value={(wilaya.orders / maxWilayaOrders) * 100} className="h-2 bg-emerald-100 dark:bg-emerald-950" indicatorColor="bg-emerald-500" />
              </div>
            ))}
            {rankings.wilayas?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Employee Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Employés (Confirmations)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.employees?.map((emp: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-900/50 dark:text-blue-400">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{emp.name}</p>
                </div>
                <div className="font-medium text-sm">
                  {emp.confirmations} confs
                </div>
              </div>
            ))}
            {rankings.employees?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
