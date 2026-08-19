'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth';
import api from '@/lib/api';
import { Package2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      const { user, access_token } = response.data;
      
      setAuth(user, access_token);
      
      // Store token explicitly for initial loads
      localStorage.setItem('access_token', access_token);
      
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lamsti OS</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace de travail
          </p>
        </div>

        <Card className="border-border/50 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleLogin}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@lamsti.dz"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive font-medium">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
