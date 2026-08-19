'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Wilaya {
    id: number;
    code: string;
    name_fr: string;
    name_ar: string;
    real_shipping_cost_home: string | null;
    real_shipping_cost_desk: string | null;
    return_cost: string | null;
}

export default function WilayasSettingsPage() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<Wilaya>>({});

    const { data: wilayas, isLoading } = useQuery({
        queryKey: ['wilayas'],
        queryFn: async () => {
            const res = await api.get('/wilayas');
            return res.data as Wilaya[];
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: number; data: Partial<Wilaya> }) => {
            const res = await api.put(`/wilayas/${data.id}`, data.data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('تم تحديث أسعار الولاية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['wilayas'] });
            setEditingId(null);
            setEditData({});
        },
        onError: () => {
            toast.error('حدث خطأ أثناء التحديث');
        }
    });

    const startEdit = (wilaya: Wilaya) => {
        setEditingId(wilaya.id);
        setEditData({
            real_shipping_cost_home: wilaya.real_shipping_cost_home,
            real_shipping_cost_desk: wilaya.real_shipping_cost_desk,
            return_cost: wilaya.return_cost,
        });
    };

    const handleSave = (id: number) => {
        updateMutation.mutate({ id, data: editData });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">أسعار التوصيل (الولايات)</h1>
                <p className="text-muted-foreground mt-1">
                    إدارة الأسعار الحقيقية للتوصيل والروتور لحساب الأرباح بدقة.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الولايات (58)</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">الكود</TableHead>
                                        <TableHead>الولاية</TableHead>
                                        <TableHead className="text-center">السعر الحقيقي (منزل)</TableHead>
                                        <TableHead className="text-center">السعر الحقيقي (مكتب)</TableHead>
                                        <TableHead className="text-center">تكلفة الروتور</TableHead>
                                        <TableHead className="text-left">إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wilayas?.map((wilaya) => (
                                        <TableRow key={wilaya.id}>
                                            <TableCell className="font-medium">{wilaya.code}</TableCell>
                                            <TableCell>
                                                {wilaya.name_ar} <span className="text-muted-foreground text-sm ml-2">({wilaya.name_fr})</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {editingId === wilaya.id ? (
                                                    <Input
                                                        type="number"
                                                        className="w-24 mx-auto text-center"
                                                        value={editData.real_shipping_cost_home || ''}
                                                        onChange={(e) => setEditData({ ...editData, real_shipping_cost_home: e.target.value })}
                                                    />
                                                ) : (
                                                    <span className="font-semibold">{wilaya.real_shipping_cost_home || '-'} دج</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {editingId === wilaya.id ? (
                                                    <Input
                                                        type="number"
                                                        className="w-24 mx-auto text-center"
                                                        value={editData.real_shipping_cost_desk || ''}
                                                        onChange={(e) => setEditData({ ...editData, real_shipping_cost_desk: e.target.value })}
                                                    />
                                                ) : (
                                                    <span className="font-semibold">{wilaya.real_shipping_cost_desk || '-'} دج</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {editingId === wilaya.id ? (
                                                    <Input
                                                        type="number"
                                                        className="w-24 mx-auto text-center"
                                                        value={editData.return_cost || ''}
                                                        onChange={(e) => setEditData({ ...editData, return_cost: e.target.value })}
                                                    />
                                                ) : (
                                                    <span className="font-semibold text-red-500">{wilaya.return_cost || '-'} دج</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-left">
                                                {editingId === wilaya.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Button size="sm" onClick={() => handleSave(wilaya.id)} disabled={updateMutation.isPending}>
                                                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                                            حفظ
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                            إلغاء
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => startEdit(wilaya)}>
                                                        تعديل
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
