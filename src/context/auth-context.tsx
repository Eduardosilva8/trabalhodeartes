'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseConfig } from '@/lib/firebase';
import { Loader2, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseConfigured = !!auth;
  const areEnvVarsPresent = !!firebaseConfig.apiKey;

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isFirebaseConfigured]);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.error("Firebase não está configurado. Não é possível fazer login.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com o Google", error);
    }
  };

  const logout = async () => {
    if (!auth) {
      console.error("Firebase não está configurado. Não é possível fazer logout.");
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  const value = { user, loading, signInWithGoogle, logout };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-6 w-6" /> Configuração do Firebase Incompleta
            </CardTitle>
            <CardDescription>
              Para habilitar a autenticação, você precisa configurar suas credenciais do Firebase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Ação Necessária</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  {areEnvVarsPresent ? (
                    <p>
                      A configuração do Firebase foi encontrada, mas a inicialização falhou. Verifique se as credenciais em seu arquivo <code>.env</code> estão corretas e se o projeto Firebase está configurado para aceitar requisições deste domínio.
                    </p>
                  ) : (
                    <p>
                      Parece que as chaves de API do seu projeto Firebase não foram adicionadas ao ambiente.
                    </p>
                  )}
                  <p>
                    Por favor, adicione suas credenciais do Firebase ao arquivo <code>.env</code> na raiz do seu projeto e reinicie o servidor de desenvolvimento.
                  </p>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {`NEXT_PUBLIC_FIREBASE_API_KEY=sua-chave-de-api
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-dominio-auth
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-id-de-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-id-de-remetente
NEXT_PUBLIC_FIREBASE_APP_ID=seu-id-de-aplicativo`}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
