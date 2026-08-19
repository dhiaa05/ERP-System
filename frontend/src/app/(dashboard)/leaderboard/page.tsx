'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trophy, Medal, Crown, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Fetch Leaderboard
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leaderboard', dateRange],
    queryFn: async () => {
      const res = await api.get('/leaderboard', { params: dateRange });
      return res.data?.data;
    },
    retry: false
  });

  // Fetch Visibility Setting (Admin only)
  const { data: visibilityData } = useQuery({
    queryKey: ['leaderboard_visibility'],
    queryFn: async () => {
      const res = await api.get('/settings/leaderboard-visibility');
      return res.data;
    },
    enabled: user?.role === 'admin'
  });

  const toggleVisibility = useMutation({
    mutationFn: async (visible: boolean) => {
      await api.post('/settings/leaderboard-visibility', { visible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard_visibility'] });
    }
  });

  // Check if forbidden (Hidden from employee)
  if (isError && (error as any).response?.status === 403) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-center">Classement Temporairement Masqué</h2>
        <p className="text-muted-foreground text-center max-w-md">
          L'administrateur a masqué le tableau des scores pour le moment. Continuez votre excellent travail, les résultats seront bientôt révélés !
        </p>
      </div>
    );
  }

  const top3 = data?.slice(0, 3) || [];
  const rest = data?.slice(3) || [];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leaderboard Gamifié</h2>
          <p className="text-muted-foreground">Classement des agents de confirmation basé sur leurs performances.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-2 bg-card border px-4 py-2 rounded-md shadow-sm">
              <Switch 
                id="visibility" 
                checked={visibilityData?.leaderboard_visible_to_employees === 'true'}
                onCheckedChange={(checked) => toggleVisibility.mutate(checked)}
              />
              <Label htmlFor="visibility" className="cursor-pointer">
                Visible pour l'équipe
              </Label>
            </div>
          )}

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
      </div>

      {isLoading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* PODIUM */}
          {top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mt-10 mb-6">
              {/* 2nd Place */}
              {top3[1] && (
                <Card className="relative w-full md:w-64 border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-md transform md:-translate-y-4">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-200 p-3 rounded-full border-4 border-white dark:border-background">
                    <Medal className="h-8 w-8 text-slate-500" />
                  </div>
                  <CardContent className="pt-12 pb-6 flex flex-col items-center text-center">
                    <h3 className="font-bold text-xl">{top3[1].employee.first_name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">2ème Place</p>
                    <div className="text-3xl font-black text-slate-700 dark:text-slate-300">{top3[1].score} <span className="text-sm font-normal">pts</span></div>
                    
                    <div className="mt-4 text-xs grid grid-cols-2 gap-x-4 gap-y-2 text-left w-full border-t pt-4">
                      <div className="flex flex-col"><span className="text-muted-foreground">Livraison</span><span className="font-semibold">{top3[1].rates.delivery}%</span></div>
                      <div className="flex flex-col"><span className="text-muted-foreground">Confirmation</span><span className="font-semibold">{top3[1].rates.confirmation}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <Card className="relative w-full md:w-72 border-amber-200 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/40 dark:to-background shadow-xl z-10">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-400 p-4 rounded-full border-4 border-white dark:border-background shadow-lg shadow-amber-500/20">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <CardContent className="pt-16 pb-8 flex flex-col items-center text-center">
                    <h3 className="font-bold text-2xl">{top3[0].employee.first_name} {top3[0].employee.last_name}</h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-4">Champion</p>
                    <div className="text-5xl font-black text-amber-500">{top3[0].score} <span className="text-lg font-normal">pts</span></div>
                    
                    <div className="mt-6 text-sm grid grid-cols-2 gap-x-6 gap-y-3 text-left w-full border-t border-amber-100 dark:border-amber-900/50 pt-4">
                      <div className="flex flex-col"><span className="text-muted-foreground">Livraison</span><span className="font-semibold">{top3[0].rates.delivery}%</span></div>
                      <div className="flex flex-col"><span className="text-muted-foreground">Confirmation</span><span className="font-semibold">{top3[0].rates.confirmation}%</span></div>
                      <div className="flex flex-col"><span className="text-muted-foreground">Total Profit</span><span className="font-semibold text-emerald-500">{top3[0].rates.total_profit} DZD</span></div>
                      <div className="flex flex-col"><span className="text-muted-foreground">Commandes</span><span className="font-semibold">{top3[0].raw.delivered} livrées</span></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <Card className="relative w-full md:w-64 border-orange-200 bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-background shadow-md transform md:-translate-y-4">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-300 p-3 rounded-full border-4 border-white dark:border-background">
                    <Medal className="h-8 w-8 text-orange-700 dark:text-orange-900" />
                  </div>
                  <CardContent className="pt-12 pb-6 flex flex-col items-center text-center">
                    <h3 className="font-bold text-xl">{top3[2].employee.first_name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">3ème Place</p>
                    <div className="text-3xl font-black text-orange-700 dark:text-orange-500">{top3[2].score} <span className="text-sm font-normal">pts</span></div>
                    
                    <div className="mt-4 text-xs grid grid-cols-2 gap-x-4 gap-y-2 text-left w-full border-t pt-4">
                      <div className="flex flex-col"><span className="text-muted-foreground">Livraison</span><span className="font-semibold">{top3[2].rates.delivery}%</span></div>
                      <div className="flex flex-col"><span className="text-muted-foreground">Confirmation</span><span className="font-semibold">{top3[2].rates.confirmation}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* TABLE */}
          {data?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Classement Complet</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rang</TableHead>
                      <TableHead>Employé</TableHead>
                      <TableHead className="text-right">Score Global</TableHead>
                      <TableHead className="text-right">Livraison</TableHead>
                      <TableHead className="text-right">Confirmation</TableHead>
                      <TableHead className="text-right">Commandes Livrées</TableHead>
                      <TableHead className="text-right">Profit Généré</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item: any, idx: number) => (
                      <TableRow key={item.employee.id} className={idx < 3 ? "bg-muted/30 font-medium" : ""}>
                        <TableCell className="text-center font-bold">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </TableCell>
                        <TableCell>{item.employee.first_name} {item.employee.last_name}</TableCell>
                        <TableCell className="text-right font-bold text-primary">{item.score} pts</TableCell>
                        <TableCell className="text-right">{item.rates.delivery}%</TableCell>
                        <TableCell className="text-right">{item.rates.confirmation}%</TableCell>
                        <TableCell className="text-right">{item.raw.delivered} / {item.raw.sent}</TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{item.rates.total_profit.toLocaleString()} DZD</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {data?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucune donnée disponible pour cette période.
            </div>
          )}
        </>
      )}
    </div>
  );
}
