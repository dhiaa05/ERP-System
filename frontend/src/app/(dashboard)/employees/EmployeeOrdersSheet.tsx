import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeOrdersSheetProps {
    employee: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EmployeeOrdersSheet({ employee, open, onOpenChange }: EmployeeOrdersSheetProps) {
    const [page, setPage] = useState(1);
    const [productId, setProductId] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { data: products } = useQuery({
        queryKey: ['products-list'],
        queryFn: async () => {
            const res = await api.get('/products', { params: { per_page: 100 } });
            return res.data?.data || [];
        }
    });

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['employee-orders', employee?.id, page, productId, dateFrom, dateTo],
        queryFn: async () => {
            if (!employee) return null;
            const params: any = {
                confirmed_by: employee.id,
                page,
                per_page: 20,
            };
            if (productId && productId !== 'all') params.product_id = productId;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await api.get('/orders', { params });
            return res.data;
        },
        enabled: !!employee && open,
    });

    const orders = ordersData?.data || [];
    const meta = ordersData?.meta || null;

    const handleResetFilters = () => {
        setProductId('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-4xl overflow-y-auto w-full">
                <SheetHeader className="mb-6">
                    <SheetTitle>Commandes confirmées par {employee?.name}</SheetTitle>
                    <SheetDescription>
                        Historique complet des commandes traitées par cette employée.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-muted/30 p-4 rounded-lg border">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Produit</label>
                        <Select value={productId} onValueChange={(val) => { setProductId(val); setPage(1); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tous les produits" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les produits</SelectItem>
                                {products?.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Date de</label>
                        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
                    </div>

                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Date à</label>
                        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
                    </div>

                    <Button variant="outline" onClick={handleResetFilters}>
                        Réinitialiser
                    </Button>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Date & Réf</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Produits (Réels)</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Aucune commande trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.reference}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(order.order_date || order.created_at), 'yyyy-MM-dd')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.customer_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.wilaya_name}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-sm">
                                            {order.items?.map((i: any) => (
                                                <div key={i.id} title={i.product_name}>
                                                    {i.quantity}x {i.product_name}
                                                </div>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                order.status.toLowerCase() === 'livré' || order.status.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                order.status.toLowerCase() === 'returned' || order.status.toLowerCase() === 'retour' || order.status.toLowerCase() === 'refused' ? 'bg-rose-100 text-rose-700 border-rose-200' : ''
                                            }>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(order.total_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Affichage {meta.from} à {meta.to} sur {meta.total} commandes
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">
                                Page {meta.current_page} / {meta.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === meta.last_page}
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
