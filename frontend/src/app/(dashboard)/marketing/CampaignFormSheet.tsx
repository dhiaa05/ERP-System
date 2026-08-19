'use client';

import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { format } from 'date-fns';

interface CampaignFormData {
  name: string;
  product_id: string;
  date: string;
  spend_usd?: number;
  exchange_rate?: number;
  facebook_spend: number;
  leads: number;
  notes: string;
}

export function CampaignFormSheet({ campaign, open, onOpenChange }: { campaign?: any, open: boolean, onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    },
  });

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CampaignFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  const spendUsd = useWatch({ control, name: 'spend_usd' });
  const exchangeRate = useWatch({ control, name: 'exchange_rate' });

  useEffect(() => {
    if (spendUsd && exchangeRate) {
      setValue('facebook_spend', Number((spendUsd * exchangeRate).toFixed(2)));
    }
  }, [spendUsd, exchangeRate, setValue]);

  useEffect(() => {
    if (open) {
      if (campaign) {
        reset({
          name: campaign.name,
          product_id: campaign.product_id?.toString() || '',
          date: campaign.date,
          spend_usd: campaign.spend_usd,
          exchange_rate: campaign.exchange_rate,
          facebook_spend: campaign.facebook_spend,
          leads: campaign.leads,
          notes: campaign.notes || '',
        });
      } else {
        reset({
          name: '',
          product_id: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          spend_usd: 0,
          exchange_rate: 235,
          facebook_spend: 0,
          leads: 0,
          notes: '',
        });
      }
    }
  }, [campaign, open, reset]);

  const mutation = useMutation({
    mutationFn: (newCampaign: CampaignFormData) => {
      if (campaign) {
        return api.put(`/campaigns/${campaign.id}`, newCampaign);
      }
      return api.post('/campaigns', newCampaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{campaign ? 'Modifier la Campagne' : 'Nouvelle Campagne Meta'}</SheetTitle>
          <SheetDescription>
            Saisissez les dépenses publicitaires.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la Campagne</Label>
            <Input id="name" placeholder="Ex: CBO_ProduitX_Juillet" {...register('name', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product_id">Produit Associé</Label>
            <Controller
              name="product_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date d'exécution</Label>
            <Input id="date" type="date" {...register('date', { required: true })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spend_usd">Dépense (USD)</Label>
              <Input id="spend_usd" type="number" step="0.01" {...register('spend_usd', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchange_rate">Taux Change (DZD)</Label>
              <Input id="exchange_rate" type="number" step="0.01" {...register('exchange_rate', { valueAsNumber: true })} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_spend">Dépense Calc. (DZD)</Label>
              <Input id="facebook_spend" type="number" step="0.01" className="bg-muted" readOnly {...register('facebook_spend', { required: true, valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leads">Leads Générés</Label>
              <Input id="leads" type="number" {...register('leads', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} />
          </div>
          <SheetFooter className="pt-6">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Annuler
            </SheetClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : (campaign ? 'Modifier' : 'Enregistrer')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
