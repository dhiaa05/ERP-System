'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface OrderDetailSheetProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: OrderDetailSheetProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    enabled: !!orderId,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return <Badge variant="default" className="bg-green-500">Livré</Badge>;
      case 'confirmed': return <Badge variant="default" className="bg-blue-500">Confirmé</Badge>;
      case 'sent': return <Badge variant="default" className="bg-amber-500">Expédié</Badge>;
      case 'returned': return <Badge variant="secondary">Retourné</Badge>;
      case 'refused': return <Badge variant="destructive">Refusé</Badge>;
      case 'cancelled': return <Badge variant="destructive">Annulé</Badge>;
      case 'unreachable': return <Badge variant="secondary" className="bg-gray-500 text-white">Injoignable</Badge>;
      case 'pending':
      default: return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-2xl">Commande {order?.reference}</SheetTitle>
              <SheetDescription>
                Réf Externe: {order?.external_reference || 'N/A'}
              </SheetDescription>
            </div>
            {order && getStatusBadge(order.status)}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">Chargement des détails...</div>
        ) : !order ? (
          <div className="text-center text-muted-foreground mt-10">Commande introuvable</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Informations Client</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Nom Complet</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Téléphone</span>
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Adresse</span>
                  <span className="font-medium">
                    {order.customer_address || '-'}, {order.commune_name}, {order.wilaya_name}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Articles Commandés</h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-muted-foreground">Qté: {item.quantity} x {item.unit_price} DZD</div>
                    </div>
                    <div className="font-semibold">{item.total_price} DZD</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{order.total_amount - order.shipping_fee} DZD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>{order.shipping_fee} DZD</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{order.total_amount} DZD</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-600 mb-1">Notes / Remarques</h4>
                <p className="text-sm text-amber-700/80">{order.notes}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground text-center mt-8">
              Créée le {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
