'use client';

import { useAuth } from '@/context/auth-context';
import { LoginClient } from '@/components/login-client';
import { QuizClient } from '@/components/quiz-client';
import { UserMenu } from '@/components/user-menu';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      {user ? (
        <>
          <div className="absolute top-4 right-4">
            <UserMenu />
          </div>
          <QuizClient />
        </>
      ) : (
        <LoginClient />
      )}
    </main>
  );
}
