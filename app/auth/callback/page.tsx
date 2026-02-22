"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase will automatically handle the token in the URL
    // We just need to wait for the session to be established
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        if (session) {
          router.push('/simulator');
        } else {
          router.push('/login');
        }
      }, 500);
    };

    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
      <p className="text-gray-600">Confirming your email...</p>
    </main>
  );
}
