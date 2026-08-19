"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InsightsAlerts({ insights }: { insights: any }) {
  if (!insights) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* 1. Executive Summary */}
      <Card className="col-span-1 lg:col-span-1 border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10">
        <CardHeader>
          <CardTitle className="text-emerald-800 dark:text-emerald-400 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Résumé Exécutif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {insights.summary}
          </p>
        </CardContent>
      </Card>

      {/* 2. Smart Alerts */}
      <Card className="col-span-1 lg:col-span-1 border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-900/10">
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-400 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Alertes Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.alerts?.length > 0 ? (
            insights.alerts.map((alert: string, idx: number) => (
              <Alert key={idx} variant="destructive" className="bg-white dark:bg-zinc-950">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))
          ) : (
            <p className="text-sm text-rose-700 dark:text-rose-300">Aucune alerte critique pour le moment. Tout semble correct !</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Business Insights */}
      <Card className="col-span-1 lg:col-span-1 border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.recommendations?.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1 text-sm text-blue-700 dark:text-blue-300">
              {insights.recommendations.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Le système analyse actuellement vos données pour formuler des recommandations stratégiques.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
