'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Plus, Search, Edit2, CheckCircle2, XCircle, ListOrdered } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import EmployeeOrdersSheet from './EmployeeOrdersSheet';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const [ordersSheetOpen, setOrdersSheetOpen] = useState(false);
  const [selectedOrdersEmployee, setSelectedOrdersEmployee] = useState<any>(null);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      role: 'confirmation',
      is_active: true
    }
  });

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', search],
    queryFn: async () => {
      const res = await api.get('/employees', { params: { search, per_page: 50 } });
      return res.data?.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingEmployee) {
        return api.put(`/employees/${editingEmployee.id}`, data);
      }
      return api.post('/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsSheetOpen(false);
      reset();
      setEditingEmployee(null);
    }
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setValue('name', employee.name);
    setValue('phone', employee.phone || '');
    setValue('role', employee.role);
    setValue('is_active', employee.is_active);
    setIsSheetOpen(true);
  };

  const handleViewOrders = (employee: any) => {
    setSelectedOrdersEmployee(employee);
    setOrdersSheetOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="default" className="bg-purple-500">Admin</Badge>;
      case 'confirmation': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Confirmation</Badge>;
      case 'delivery': return <Badge variant="outline" className="text-emerald-600 border-emerald-200">Delivery</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Employés</h2>
          <p className="text-muted-foreground">Gérez votre équipe et leurs accès au système.</p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            reset();
            setEditingEmployee(null);
          }
        }}>
          <SheetTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus className="h-4 w-4" />
            Ajouter un Employé
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingEmployee ? 'Modifier' : 'Ajouter'} un Employé</SheetTitle>
              <SheetDescription>
                Remplissez les informations du membre de l'équipe.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Nom Complet</Label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input placeholder="Nom Complet" {...field} />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => <Input placeholder="0555..." {...field} />}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission (DZD)</Label>
                  <Controller
                    name="commission_per_delivered"
                    control={control}
                    render={({ field }) => <Input type="number" step="0.01" placeholder="100" {...field} />}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rôle (Département)</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="confirmation">Agent de Confirmation</SelectItem>
                        <SelectItem value="delivery">Gestionnaire de Livraison</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex items-center justify-between border rounded-md p-4 bg-muted/30">
                <div className="space-y-0.5">
                  <Label>Compte Actif</Label>
                  <p className="text-xs text-muted-foreground">Les employés inactifs ne peuvent pas se connecter.</p>
                </div>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              <SheetFooter className="mt-8">
                <SheetClose render={<Button variant="outline" type="button" />}>
                  Annuler
                </SheetClose>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>Liste des Employés</CardTitle>
            <CardDescription>Tous les membres enregistrés dans le système.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par nom..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-6">Nom Complet</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Chargement...</TableCell>
                </TableRow>
              ) : employees?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Aucun employé trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                employees?.map((emp: any) => (
                  <TableRow key={emp.id}>
                    <TableCell className="pl-6 font-medium">
                      {emp.name}
                    </TableCell>
                    <TableCell>{emp.phone || '-'}</TableCell>
                    <TableCell>{getRoleBadge(emp.role)}</TableCell>
                    <TableCell>
                      {emp.is_active ? (
                        <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full w-max">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-100 px-2 py-1 rounded-full w-max">
                          <XCircle className="h-3 w-3 mr-1" /> Inactif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrders(emp)}>
                        <ListOrdered className="h-4 w-4 mr-2" />
                        Commandes
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeOrdersSheet 
        employee={selectedOrdersEmployee} 
        open={ordersSheetOpen} 
        onOpenChange={setOrdersSheetOpen} 
      />
    </div>
  );
}
