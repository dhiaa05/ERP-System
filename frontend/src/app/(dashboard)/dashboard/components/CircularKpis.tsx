"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

function CircularProgress({ value, title, colorClass, hexColor, subtitle }: { value: number, title: string, colorClass: string, hexColor: string, subtitle?: string }) {
  const data = [{ name: title, value: value }];

  return (
    <Card className="flex flex-col items-center justify-center p-6 shadow-sm border-none bg-card/50">
      <CardContent className="p-0 flex flex-col items-center justify-center w-full">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
        
        <div className="relative h-32 w-32 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="70%" 
              outerRadius="100%" 
              barSize={12} 
              data={data} 
              startAngle={90} 
              endAngle={-270}
            >
              <PolarAngleAxis 
                type="number" 
                domain={[0, 100]} 
                angleAxisId={0} 
                tick={false} 
              />
              <RadialBar
                background={{ fill: 'rgba(0,0,0,0.05)' }}
                dataKey="value"
                cornerRadius={10}
                fill={hexColor}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colorClass}`}>{value}%</span>
          </div>
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-4 text-center">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function CircularKpis({ circularKpis }: { circularKpis: any }) {
  if (!circularKpis) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <CircularProgress 
        title="Business Health" 
        value={circularKpis.health_score} 
        colorClass={circularKpis.health_score > 70 ? "text-green-500" : "text-amber-500"}
        hexColor={circularKpis.health_score > 70 ? "#22c55e" : "#f59e0b"}
        subtitle="Overall Score"
      />
      <CircularProgress 
        title="Confirmation Rate" 
        value={circularKpis.confirmation_rate} 
        colorClass="text-blue-500"
        hexColor="#3b82f6"
        subtitle="Target: 80%"
      />
      <CircularProgress 
        title="Delivery Rate" 
        value={circularKpis.delivery_rate} 
        colorClass="text-emerald-500"
        hexColor="#10b981"
        subtitle="Target: 70%"
      />
      <CircularProgress 
        title="Return Rate" 
        value={circularKpis.return_rate} 
        colorClass="text-rose-500"
        hexColor="#f43f5e"
        subtitle="Lower is better"
      />
      <CircularProgress 
        title="Refusal Rate" 
        value={circularKpis.refusal_rate} 
        colorClass="text-orange-500"
        hexColor="#f97316"
        subtitle="Lower is better"
      />
      <CircularProgress 
        title="Employee Score" 
        value={circularKpis.employee_score} 
        colorClass="text-indigo-500"
        hexColor="#6366f1"
        subtitle="Team Performance"
      />
    </div>
  );
}
