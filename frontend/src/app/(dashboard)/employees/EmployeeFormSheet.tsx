'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient, useMutation } from '@tanstack/react-query';
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

interface EmployeeFormData {
  name: string;
  phone: string;
  role: string;
  salary: number;
  hire_date: string;
  notes: string;
}

export function EmployeeFormSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeFormData>({
    defaultValues: {
      role: 'confirmation',
    }
  });

  const mutation = useMutation({
    mutationFn: (newEmployee: EmployeeFormData) => api.post('/employees', newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="flex items-center gap-2" />}>
        <Plus className="h-4 w-4" />
        Ajouter un Employé
      </SheetTrigger>
      <SheetContent className="sm:max-w-[425px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nouvel Employé</SheetTitle>
          <SheetDescription>
            Ajoutez un membre à votre équipe (Confirmation, Support, Logistique, etc).
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom Complet</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select onValueChange={(val) => setValue('role', val)} defaultValue="confirmation">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmation">Équipe Confirmation</SelectItem>
                <SelectItem value="support">Service Client (Support)</SelectItem>
                <SelectItem value="logistics">Logistique & Suivi</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salaire Base (DZD)</Label>
              <Input id="salary" type="number" step="0.01" {...register('salary')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Date d'embauche</Label>
              <Input id="hire_date" type="date" {...register('hire_date')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Remarques</Label>
            <Input id="notes" {...register('notes')} />
          </div>
          <SheetFooter className="pt-6">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Annuler
            </SheetClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Création...' : 'Créer Employé'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
