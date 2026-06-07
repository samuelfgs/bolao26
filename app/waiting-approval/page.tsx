"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function WaitingApproval() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // In a real app, we would fetch the user's status from our DB here
      // For now, we'll just show the message. 
      // The middleware/layout should handle redirecting them away if they get approved.
      setLoading(false);
    }
    checkStatus();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stadium-green-800 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stadium-yellow border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stadium-green-800 p-6 relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-full"></div>
      </div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-stadium-yellow rounded-full mb-4 shadow-xl animate-pulse">
            <svg className="w-14 h-14 text-stadium-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Aguardando <span className="text-stadium-yellow">Escalação!</span>
          </h1>
          <p className="text-xl text-green-100 font-medium">
            Sua solicitação foi enviada para os organizadores.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-stadium-green-600 space-y-6 text-gray-900 text-left">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-stadium-green-100 flex items-center justify-center shrink-0 mt-1">
                <span className="text-stadium-green-800 font-bold">1</span>
              </div>
              <p className="text-sm text-gray-600">
                Os administradores estão revisando seu cadastro.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-stadium-green-100 flex items-center justify-center shrink-0 mt-1">
                <span className="text-stadium-green-800 font-bold">2</span>
              </div>
              <p className="text-sm text-gray-600">
                Assim que aprovado, você terá acesso total aos palpites e rankings.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-stadium-green-100 flex items-center justify-center shrink-0 mt-1">
                <span className="text-stadium-green-800 font-bold">3</span>
              </div>
              <p className="text-sm text-gray-600">
                Fique atento ao seu telefone/e-mail para a confirmação.
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-stadium-green-600 text-white font-black rounded-xl hover:bg-stadium-green-700 transform active:scale-95 transition-all shadow-lg uppercase tracking-wider"
          >
            Verificar Status
          </button>
        </div>
      </div>
    </div>
  );
}
