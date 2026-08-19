'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface CohortData {
    date: string;
    leads: number;
    delivered: number;
    returned: number;
    delivery_rate: number;
    return_rate: number;
    revenue: number;
    cogs: number;
    commissions: number;
    shipping_subsidy: number;
    return_cost: number;
    ad_spend: number;
    net_profit: number;
    status: 'profitable' | 'losing' | 'break-even';
}

interface Product {
    id: number;
    name: string;
}

export default function AnalyticsPage() {
    const [selectedProductId, setSelectedProductId] = useState<string>('all');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (date: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(date)) {
            newSet.delete(date);
        } else {
            newSet.add(date);
        }
        setExpandedRows(newSet);
    };

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data.data as Product[];
        }
    });

    const { data: cohorts, isLoading } = useQuery({
        queryKey: ['cohorts', selectedProductId],
        queryFn: async () => {
            const params = selectedProductId !== 'all' ? { product_id: selectedProductId } : {};
            const res = await api.get('/analytics/cohorts', { params });
            return res.data.data as CohortData[];
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">التحليلات والأرباح</h1>
                    <p className="text-muted-foreground mt-1">
                        تتبع الأرباح الصافية الحقيقية لكل يوم عمل (Cohort Analysis)
                    </p>
                </div>
                <div className="w-64">
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                            <SelectValue placeholder="تصفية حسب المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل المنتجات</SelectItem>
                            {products?.map(product => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>الأداء اليومي (Cohort Analysis)</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10"></TableHead>
                                        <TableHead>تاريخ العمل</TableHead>
                                        <TableHead className="text-center">الطلبيات</TableHead>
                                        <TableHead className="text-center">التأكيد</TableHead>
                                        <TableHead className="text-center">الشحن</TableHead>
                                        <TableHead className="text-center">توصيل / روتور</TableHead>
                                        <TableHead className="text-center">Ad Spend</TableHead>
                                        <TableHead className="text-center">مبيعات</TableHead>
                                        <TableHead className="text-center">تكلفة منتج+توصيل</TableHead>
                                        <TableHead className="text-right">الربح الصافي</TableHead>
                                        <TableHead className="text-center">الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cohorts?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                                لا توجد بيانات متاحة
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cohorts?.map((row) => (
                                            <React.Fragment key={row.date}>
                                                <TableRow className="group">
                                                    <TableCell>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-6 w-6 rounded-full"
                                                            onClick={() => toggleRow(row.date)}
                                                        >
                                                            {expandedRows.has(row.date) ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{row.date}</TableCell>
                                                    <TableCell className="text-center">{row.leads}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="font-semibold text-blue-600">{row.confirmed}</div>
                                                        <div className="text-[10px] text-muted-foreground">{row.confirmation_rate}%</div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        {row.sent}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-sm">
                                                            <span className="text-green-600 font-semibold">{row.delivered}</span>
                                                            <span className="text-muted-foreground mx-1">/</span>
                                                            <span className="text-red-500 font-semibold">{row.returned}</span>
                                                        </div>
                                                        <div className="text-[10px] mt-0.5">
                                                            <span className="text-green-600 font-medium">{row.real_delivery_rate}% توصيل</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-red-500 font-medium">
                                                        {formatCurrency(row.ad_spend)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        {formatCurrency(row.revenue)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-red-500">
                                                        <div className="text-xs">
                                                            سلعة: {formatCurrency(row.cogs)}
                                                        </div>
                                                        {(row.shipping_subsidy > 0 || row.return_cost > 0) && (
                                                            <div className="text-xs">
                                                                توصيل: {formatCurrency(row.shipping_subsidy + row.return_cost)}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        <span className={row.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {formatCurrency(row.net_profit)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {row.status === 'profitable' ? (
                                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">رابح</Badge>
                                                        ) : row.status === 'losing' ? (
                                                            <Badge variant="destructive">خاسر</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">متعادل</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                {expandedRows.has(row.date) && row.orders && row.orders.length > 0 && (
                                                    <TableRow className="bg-muted/30">
                                                        <TableCell colSpan={11} className="p-0">
                                                            <div className="p-4 border-b border-t border-dashed">
                                                                <h4 className="text-sm font-semibold mb-3 flex items-center">
                                                                    تفاصيل طلبيات يوم {row.date}
                                                                </h4>
                                                                <div className="rounded-md border bg-background">
                                                                    <Table>
                                                                        <TableHeader className="bg-muted/50">
                                                                            <TableRow>
                                                                                <TableHead className="text-xs py-2">رقم الطلبية</TableHead>
                                                                                <TableHead className="text-xs py-2">المنتج</TableHead>
                                                                                <TableHead className="text-xs py-2">الحالة</TableHead>
                                                                                <TableHead className="text-xs py-2 text-center">المبلغ الكلي</TableHead>
                                                                                <TableHead className="text-xs py-2 text-center">مصاريف</TableHead>
                                                                                <TableHead className="text-xs py-2 text-right">الربح</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {row.orders.map((o) => (
                                                                                <TableRow key={o.id} className={o.is_delivered ? 'bg-green-50/50 dark:bg-green-950/20' : (o.is_returned ? 'bg-red-50/50 dark:bg-red-950/20' : 'opacity-60')}>
                                                                                    <TableCell className="py-2 text-xs font-medium">
                                                                                        {o.reference}
                                                                                        <div className="text-[10px] text-muted-foreground">{o.customer_name}</div>
                                                                                    </TableCell>
                                                                                    <TableCell className="py-2 text-xs truncate max-w-[150px]" title={o.products}>{o.products || '-'}</TableCell>
                                                                                    <TableCell className="py-2 text-xs">
                                                                                        <Badge variant="outline" className={`text-[10px] px-1 ${o.is_delivered ? 'border-green-500 text-green-600' : (o.is_returned ? 'border-red-500 text-red-600' : '')}`}>
                                                                                            {o.status}
                                                                                        </Badge>
                                                                                    </TableCell>
                                                                                    <TableCell className="py-2 text-xs text-center">{formatCurrency(o.total_amount)}</TableCell>
                                                                                    <TableCell className="py-2 text-xs text-center text-red-500">
                                                                                        {o.is_delivered && o.shipping_cost > 0 && <span className="block">Livraison: {formatCurrency(o.shipping_cost)}</span>}
                                                                                        {o.is_returned && o.return_cost > 0 && <span className="block">Retour: {formatCurrency(o.return_cost)}</span>}
                                                                                        {(!o.is_delivered && !o.is_returned) && '-'}
                                                                                    </TableCell>
                                                                                    <TableCell className="py-2 text-xs text-right font-bold">
                                                                                        {(o.is_delivered || o.is_returned) ? (
                                                                                            <span className={o.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                                                {formatCurrency(o.net_profit)}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-muted-foreground">-</span>
                                                                                        )}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </TableBody>
                                {cohorts && cohorts.length > 0 && (
                                    <tfoot className="border-t bg-muted/50 font-bold">
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>المجموع الكلي</TableCell>
                                            <TableCell className="text-center">
                                                {cohorts.reduce((sum, row) => sum + row.leads, 0)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(() => {
                                                    const totalLeads = cohorts.reduce((sum, row) => sum + row.leads, 0);
                                                    const totalConfirmed = cohorts.reduce((sum, row) => sum + row.confirmed, 0);
                                                    const rate = totalLeads > 0 ? ((totalConfirmed / totalLeads) * 100).toFixed(2) : 0;
                                                    return (
                                                        <>
                                                            <div className="font-semibold text-blue-600">{totalConfirmed}</div>
                                                            <div className="text-[10px] text-muted-foreground">{rate}%</div>
                                                        </>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {cohorts.reduce((sum, row) => sum + row.sent, 0)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(() => {
                                                    const totalSent = cohorts.reduce((sum, row) => sum + row.sent, 0);
                                                    const totalDelivered = cohorts.reduce((sum, row) => sum + row.delivered, 0);
                                                    const totalReturned = cohorts.reduce((sum, row) => sum + row.returned, 0);
                                                    const rate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : 0;
                                                    return (
                                                        <>
                                                            <div className="text-sm">
                                                                <span className="text-green-600 font-semibold">{totalDelivered}</span>
                                                                <span className="text-muted-foreground mx-1">/</span>
                                                                <span className="text-red-500 font-semibold">{totalReturned}</span>
                                                            </div>
                                                            <div className="text-[10px] mt-0.5">
                                                                <span className="text-green-600 font-medium">{rate}% توصيل</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center text-red-500">
                                                {formatCurrency(cohorts.reduce((sum, row) => sum + row.ad_spend, 0))}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {formatCurrency(cohorts.reduce((sum, row) => sum + row.revenue, 0))}
                                            </TableCell>
                                            <TableCell className="text-center text-red-500">
                                                {formatCurrency(cohorts.reduce((sum, row) => sum + row.cogs + row.shipping_subsidy + row.return_cost, 0))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={cohorts.reduce((sum, row) => sum + row.net_profit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(cohorts.reduce((sum, row) => sum + row.net_profit, 0))}
                                                </span>
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
