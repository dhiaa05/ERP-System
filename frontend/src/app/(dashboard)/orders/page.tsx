'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Download, Trash } from 'lucide-react';
import { OrderDetailSheet } from './OrderDetailSheet';

export interface Order {
  id: number;
  reference: string;
  external_reference: string | null;
  customer_name: string;
  customer_phone: string;
  wilaya_name: string | null;
  commune_name: string | null;
  status: string;
  total_amount: number;
  order_date: string;
  created_at: string;
  duplicate_of_id: number | null;
  duplicate_of?: {
    reference: string;
  };
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('order_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, dateFrom, dateTo, sortBy, sortDir],
    queryFn: async () => {
      const res = await api.get('/orders', { 
        params: { 
          search, 
          date_from: dateFrom,
          date_to: dateTo,
          sort_by: sortBy,
          sort_dir: sortDir,
          include_duplicates: true, 
          per_page: 500 
        } 
      });
      return res.data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.delete('/orders/reset'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Toutes les commandes ont été supprimées avec succès.');
    },
    onError: () => {
      alert('Une erreur est survenue lors de la suppression.');
    }
  });

  const handleReset = () => {
    if (window.confirm("⚠️ ATTENTION: Êtes-vous sûr de vouloir supprimer TOUTES les commandes ? Cette action est irréversible.")) {
      resetMutation.mutate();
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc'); // default to desc when switching to new field
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Livré</Badge>;
      case 'confirmed': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Confirmé</Badge>;
      case 'sent': return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">Expédié</Badge>;
      case 'returned': return <Badge variant="secondary">Retourné</Badge>;
      case 'refused': return <Badge variant="destructive">Refusé</Badge>;
      case 'cancelled': return <Badge variant="destructive">Annulé</Badge>;
      case 'unreachable': return <Badge variant="secondary" className="bg-gray-500 text-white">Injoignable</Badge>;
      case 'pending':
      default: return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
          <p className="text-muted-foreground">Consultez l'historique et l'état des commandes synchronisées.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleReset} disabled={resetMutation.isPending}>
            <Trash className="mr-2 h-4 w-4" /> {resetMutation.isPending ? 'Suppression...' : 'Vider les commandes'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par Réf, Nom ou Téléphone..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                className="w-auto"
                title="De (Date)"
            />
            <span className="text-muted-foreground">à</span>
            <Input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                className="w-auto"
                title="À (Date)"
            />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none" 
                onClick={() => toggleSort('order_date')}
              >
                Date de commande {sortBy === 'order_date' && (sortDir === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Wilaya</TableHead>
              <TableHead>Total (DZD)</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Aucune commande trouvée.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {order.reference}
                      {order.duplicate_of_id && (
                        <div 
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          title={`Client répétitif (Ancienne Cmd: ${order.duplicate_of?.reference || '#' + order.duplicate_of_id})`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{order.order_date ? format(new Date(order.order_date), 'dd MMM yyyy', { locale: fr }) : '-'}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell>{order.wilaya_name || '-'}</TableCell>
                  <TableCell className="font-semibold">{order.total_amount}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" /> Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrderDetailSheet 
        orderId={selectedOrderId} 
        open={selectedOrderId !== null} 
        onOpenChange={(isOpen) => !isOpen && setSelectedOrderId(null)} 
      />
    </div>
  );
}
