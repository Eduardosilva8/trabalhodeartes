'use client';

import { QuizClient } from '@/components/quiz-client';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <QuizClient />
    </main>
  );
}
