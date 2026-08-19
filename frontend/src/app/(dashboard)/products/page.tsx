'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { ProductFormSheet } from './ProductFormSheet';

interface Product {
  id: number;
  name: string;
  sku: string;
  category_name: string;
  selling_price: number;
  is_active: boolean;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res = await api.get('/products', { params: { search } });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produits</h2>
          <p className="text-muted-foreground">Gérez votre catalogue de produits.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un Produit
        </Button>
        <ProductFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} product={editingProduct} />
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom ou SKU..."
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
              <TableHead>Nom du Produit</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix de Vente</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun produit trouvé.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell>{product.selling_price} DZD</TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
