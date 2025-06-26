"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer } from 'lucide-react';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.93H12V14.4H18.19C17.93 15.77 17.24 16.94 16.18 17.71V20.25H19.92C21.62 18.71 22.56 16.25 22.56 12.25Z" fill="#4285F4"/>
      <path d="M12 23C14.97 23 17.45 22.04 19.21 20.25L15.47 17.71C14.47 18.45 13.3 18.9 12 18.9C9.13 18.9 6.69 17 5.78 14.54H2V17.1C3.78 20.67 7.56 23 12 23Z" fill="#34A853"/>
      <path d="M5.78 14.54C5.57 13.84 5.45 13.12 5.45 12.38C5.45 11.63 5.57 10.91 5.78 10.21V7.65H2C1.17 9.32 0.64 11.27 0.64 13.38C0.64 15.48 1.17 17.43 2 19.1L5.78 16.54V14.54Z" fill="#FBBC05"/>
      <path d="M12 5.1C13.66 5.1 15.09 5.68 16.16 6.69L19.27 3.59C17.45 1.99 14.97 1 12 1C7.56 1 3.78 3.33 2 6.9L5.78 9.46C6.69 6.99 9.13 5.1 12 5.1Z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginClient() {
  const { signInWithGoogle } = useAuth();

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-3">
            <Hammer className="w-10 h-10 text-primary" />
            <CardTitle className="text-3xl font-headline">Mestre do Quiz Donatello</CardTitle>
        </div>
        <CardDescription className="pt-2">Faça login para começar a testar seus conhecimentos sobre o grande mestre renascentista.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={signInWithGoogle} className="w-full text-lg" size="lg">
          <GoogleIcon className="mr-2 h-6 w-6" />
          Entrar com Google
        </Button>
      </CardContent>
    </Card>
  );
}
