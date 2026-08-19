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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface SyncLog {
  id: number;
  sync_source: { name: string };
  status: 'running' | 'completed' | 'failed';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export default function SyncMonitorPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: async () => {
      const res = await api.get('/sync-logs');
      return res.data;
    },
    refetchInterval: 10000, // Refetch every 10s to see running syncs
  });

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append('file', uploadFile);
      // For MVP, we hardcode source ID 1 (Main Google Sheet).
      // In production, this would be selected via a dropdown.
      const res = await api.post('/sync-sources/1/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
      setFile(null);
      alert('Synchronisation terminée avec succès!');
    },
    onError: (err: any) => {
      alert(`Erreur de synchronisation: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running': return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Complété</Badge>;
      case 'failed': return <Badge variant="destructive">Échoué</Badge>;
      case 'running': return <Badge variant="secondary" className="text-amber-500">En cours</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Synchronisation Google Sheets</h2>
        <p className="text-muted-foreground">Importez vos commandes depuis Google Sheets (Format CSV).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importer un fichier CSV</CardTitle>
          <CardDescription>
            Téléchargez le fichier CSV depuis Google Sheets et importez-le ici pour mettre à jour la base de données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="flex items-end gap-4 max-w-lg">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input 
                id="csv" 
                type="file" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={uploadMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={!file || uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>En cours...</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" /> Lancer l'import</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statut</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead className="text-right">Traitées</TableHead>
              <TableHead className="text-right">Créées</TableHead>
              <TableHead className="text-right">Mises à jour</TableHead>
              <TableHead className="text-right">Erreurs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Chargement...</TableCell>
              </TableRow>
            ) : logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Aucun historique de synchronisation.</TableCell>
              </TableRow>
            ) : (
              logs?.map((log: SyncLog) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.sync_source?.name || 'Inconnu'}</TableCell>
                  <TableCell>{format(new Date(log.started_at), 'dd MMM yyyy, HH:mm', { locale: fr })}</TableCell>
                  <TableCell>
                    {log.completed_at 
                      ? format(new Date(log.completed_at), 'dd MMM yyyy, HH:mm', { locale: fr })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">{log.records_processed}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">+{log.records_created}</TableCell>
                  <TableCell className="text-right text-blue-600 font-medium">~{log.records_updated}</TableCell>
                  <TableCell className="text-right text-destructive font-medium">{log.records_failed}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
