'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Receipt } from 'lucide-react';
import { ExpenseFormSheet } from './ExpenseFormSheet';

interface Expense {
  id: number;
  date: string;
  category_name: string;
  description: string;
  amount: number;
}

export default function ExpensesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search],
    queryFn: async () => {
      const res = await api.get('/expenses', { params: { search } });
      return res.data;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" /> Dépenses & Frais
          </h2>
          <p className="text-muted-foreground">Gérez vos coûts opérationnels (loyer, emballage, abonnements).</p>
        </div>
        <ExpenseFormSheet />
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une dépense..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant (DZD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Chargement...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Aucune dépense trouvée.</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((exp: Expense) => (
                <TableRow key={exp.id}>
                  <TableCell>{format(new Date(exp.date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{exp.category_name}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{exp.description}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    -{exp.amount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
