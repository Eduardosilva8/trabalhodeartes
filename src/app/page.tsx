'use client';

import { QuizClient } from '@/components/quiz-client';
import { LoginClient } from '@/components/login-client';
import { UserMenu } from '@/components/user-menu';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
      {user && (
        <div className="absolute top-6 right-6">
          <UserMenu />
        </div>
      )}
      {!user ? <LoginClient /> : <QuizClient />}
    </main>
  );
}
