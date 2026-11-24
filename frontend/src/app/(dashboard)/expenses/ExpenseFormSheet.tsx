'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseFormData {
  date: string;
  expense_category_id: string;
  description: string;
  amount: number;
}

export function ExpenseFormSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await api.get('/expense-categories');
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  const mutation = useMutation({
    mutationFn: (newExpense: ExpenseFormData) => api.post('/expenses', newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Ajouter une Dépense
      </SheetTrigger>
      <SheetContent className="sm:max-w-[425px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nouvelle Dépense (Overhead)</SheetTitle>
          <SheetDescription>
            Enregistrez les coûts opérationnels (Salaires, Loyer, Emballage...).
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_category_id">Catégorie</Label>
            <Select onValueChange={(val) => setValue('expense_category_id', val || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Input id="description" placeholder="Ex: Achat de cartons d'emballage" {...register('description', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (DZD)</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount', { required: true })} />
          </div>
          <SheetFooter className="pt-6">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Annuler
            </SheetClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Création...' : 'Enregistrer'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
