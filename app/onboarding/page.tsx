"use client";

import { useState, useEffect } from "react";
import { joinPool } from "@/lib/actions/pool";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        const metadata = user.user_metadata;
        const hasName = !!(metadata.full_name || metadata.name);
        const hasPhone = !!metadata.phone;
        
        setName(metadata.full_name || metadata.name || "");
        setPhone(metadata.phone || "");
        
        if (!hasName || !hasPhone) {
          setNeedsProfileUpdate(true);
        }
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router, supabase]);

  async function handleUpdateProfileAndJoin() {
    setLoading(true);
    setError(null);
    try {
      if (needsProfileUpdate) {
        if (!name || !phone) {
          throw new Error("Por favor, preencha seu nome e telefone.");
        }
        
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            full_name: name,
            phone: phone 
          }
        });
        
        if (updateError) throw updateError;
      }

      if (!code) {
        throw new Error("Insira o código do bolão.");
      }

      await joinPool(code);
      toast.success("Perfil atualizado e solicitação enviada!");
      router.push("/waiting-approval");
    } catch (e: any) {
      const msg = e.message || "Erro ao processar. Verifique os dados.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stadium-green-800">
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
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-stadium-yellow rounded-full mb-4 shadow-xl">
            <svg className="w-12 h-12 text-stadium-green-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Quase lá, <span className="text-stadium-yellow">Craque!</span>
          </h1>
          <p className="text-green-100 font-medium">Complete seu perfil para entrar no jogo.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-stadium-green-600 space-y-6 text-gray-900">
          {error && (
            <div className="p-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-100 font-bold">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              {needsProfileUpdate && (
                <>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      placeholder="Nome Completo"
                      className="block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                      Telefone (para alertas)
                    </label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">
                      * Usaremos para avisar quando você esquecer um palpite!
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  Código de Convite
                </label>
                <input
                  type="text"
                  placeholder="EX: A1B2C3D4"
                  className="block w-full rounded-xl border-2 border-gray-100 px-4 py-4 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase font-bold placeholder:normal-case placeholder:font-medium text-center text-2xl tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <button
                onClick={handleUpdateProfileAndJoin}
                disabled={loading || !code || (needsProfileUpdate && (!name || !phone))}
                className="w-full py-4 bg-stadium-yellow text-stadium-green-900 font-black rounded-xl hover:bg-yellow-300 transform active:scale-95 transition-all shadow-lg uppercase tracking-wider disabled:opacity-30"
              >
                {loading ? "Processando..." : "Confirmar e Entrar"}
              </button>
              
              <p className="text-center text-[10px] text-gray-400 font-medium italic">
                Ainda não tem um código? Peça ao seu capitão de time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
