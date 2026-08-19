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
import { Search, Megaphone, Edit, Trash, MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { CampaignFormSheet } from './CampaignFormSheet';

interface Campaign {
  id: number;
  name: string;
  product_id: number;
  product_name: string;
  date: string;
  facebook_spend: number;
  leads: number;
}

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', search],
    queryFn: async () => {
      const res = await api.get('/campaigns', { params: { search } });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" /> Marketing & Campagnes
          </h2>
          <p className="text-muted-foreground">Suivez vos dépenses Meta Ads par produit et calculez votre CPL.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une Campagne
        </Button>
        <CampaignFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} campaign={editingCampaign} />
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une campagne..."
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
              <TableHead>Nom de la Campagne</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Dépense (DZD)</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">CPL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Chargement...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Aucune campagne trouvée.</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((camp: Campaign) => {
                const cpl = camp.leads > 0 ? (camp.facebook_spend / camp.leads).toFixed(2) : '0.00';
                return (
                  <TableRow key={camp.id}>
                    <TableCell>{format(new Date(camp.date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                    <TableCell className="font-medium">{camp.name}</TableCell>
                    <TableCell><Badge variant="outline">{camp.product_name}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{camp.facebook_spend}</TableCell>
                    <TableCell className="text-right">{camp.leads}</TableCell>
                    <TableCell className="text-right font-medium text-amber-600">{cpl} DZD</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(camp)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(camp.id)}>
                              <Trash className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
