import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Package, Crosshair, Users, Activity } from "lucide-react";

export function TopKpiCards({ topKpis }: { topKpis: any }) {
  if (!topKpis) return null;

  const items = [
    {
      title: "Business Health",
      value: `${topKpis.health_score}/100`,
      icon: Activity,
      color: topKpis.health_score > 70 ? "text-green-500" : "text-amber-500",
    },
    {
      title: "Net Profit",
      value: `DZD ${topKpis.net_profit?.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      title: "Expected Profit",
      value: `DZD ${topKpis.expected_profit?.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Delivery Rate",
      value: `${topKpis.delivery_rate}%`,
      icon: Package,
      color: topKpis.delivery_rate >= 60 ? "text-green-500" : "text-destructive",
    },
    {
      title: "Confirmation Rate",
      value: `${topKpis.confirmation_rate}%`,
      icon: Users,
      color: topKpis.confirmation_rate >= 70 ? "text-green-500" : "text-amber-500",
    },
    {
      title: "Today's Revenue",
      value: `DZD ${topKpis.today_revenue?.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      title: "Today's Orders",
      value: topKpis.today_orders,
      icon: Package,
      color: "text-indigo-400",
    },
    {
      title: "Break-even CPA",
      value: `DZD ${topKpis.break_even_cpa?.toLocaleString()}`,
      icon: Crosshair,
      color: "text-purple-500",
    },
    {
      title: "ROAS",
      value: `${topKpis.roas}x`,
      icon: TrendingUp,
      color: topKpis.roas > 2 ? "text-green-500" : "text-destructive",
    },
    {
      title: "Marketing Spend",
      value: `DZD ${topKpis.marketing_spend?.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
