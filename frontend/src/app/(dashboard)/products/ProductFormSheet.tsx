'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Plus, Trash2 } from 'lucide-react';

interface ProductFormData {
  name: string;
  sku: string;
  category_id: number;
  selling_price: number;
  purchase_price: number;
  is_active: boolean;
  quantity_rules_array?: { csv_qty: number; actual_units: number }[];
}

export function ProductFormSheet({ product, open, onOpenChange }: { product?: any, open: boolean, onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      category_id: 1,
      is_active: true,
      quantity_rules_array: []
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "quantity_rules_array"
  });

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          category_id: product.category_id || 1,
          selling_price: product.selling_price,
          purchase_price: product.purchase_price || product.purchase_cost || 0,
          is_active: product.is_active,
        });

        const qr = product.quantity_rules;
        if (qr && typeof qr === 'object') {
          const arr = Object.keys(qr).map(k => ({ csv_qty: Number(k), actual_units: Number(qr[k]) }));
          replace(arr);
        } else {
          replace([]);
        }
      } else {
        reset({
          category_id: 1,
          is_active: true,
          name: '',
          sku: '',
          selling_price: 0,
          purchase_price: 0,
        });
        replace([]);
      }
    }
  }, [product, open, reset, replace]);

  const mutation = useMutation({
    mutationFn: (newProduct: any) => {
      // transform array to object
      const rulesObj: Record<string, number> = {};
      if (newProduct.quantity_rules_array) {
        newProduct.quantity_rules_array.forEach((r: any) => {
          rulesObj[r.csv_qty.toString()] = Number(r.actual_units);
        });
      }
      
      const payload = {
        ...newProduct,
        quantity_rules: Object.keys(rulesObj).length > 0 ? rulesObj : null
      };
      
      if (product) {
        return api.put(`/products/${product.id}`, payload);
      }
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? 'Modifier un produit' : 'Ajouter un produit'}</SheetTitle>
          <SheetDescription>
            Remplissez les détails du produit ci-dessous.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du Produit</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register('sku', { required: true })} />
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="category_id">ID Catégorie</Label>
            <Input id="category_id" type="number" defaultValue={1} {...register('category_id', { required: true, valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selling_price">Prix Vente</Label>
              <Input id="selling_price" type="number" step="0.01" {...register('selling_price', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Prix Achat</Label>
              <Input id="purchase_price" type="number" step="0.01" {...register('purchase_price', { required: true })} />
            </div>
          </div>
          
          <div className="space-y-2 pt-2 border-t mt-4">
            <div className="flex items-center justify-between">
              <Label>Règles de Quantité (CSV)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ csv_qty: 1, actual_units: 1 })}>
                <Plus className="h-3 w-3 mr-1" /> Ajouter Règle
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Ex: Si CSV Qty = 1, consommer 3 unités.</p>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <Input 
                    type="number" 
                    placeholder="CSV Qty (Ex: 1)" 
                    {...register(`quantity_rules_array.${index}.csv_qty`, { required: true, valueAsNumber: true })} 
                  />
                </div>
                <span className="text-muted-foreground text-sm">➡️</span>
                <div className="flex-1">
                  <Input 
                    type="number" 
                    placeholder="Unités (Ex: 3)" 
                    {...register(`quantity_rules_array.${index}.actual_units`, { required: true, valueAsNumber: true })} 
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <SheetFooter className="pt-6">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Annuler
            </SheetClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
