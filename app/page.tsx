import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/palpites");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-stadium-green-600 via-stadium-green-700 to-stadium-green-800 text-white p-6 relative overflow-hidden">
      {/* Decorative Pitch Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full border-x border-white"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 border-b border-white"></div>
      </div>

      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="inline-block p-2 bg-stadium-yellow rounded-full mb-2">
            <svg className="w-12 h-12 text-stadium-green-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic">
            Bolão <span className="text-stadium-yellow">2026</span>
          </h1>
          <p className="text-green-100 text-xl font-medium">Onde a emoção do campo encontra seus palpites.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Pronto para o jogo?</h2>
            <p className="text-green-200 text-sm">Entre com sua conta para participar dos bolões.</p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="group relative block w-full py-4 px-6 bg-stadium-yellow text-stadium-green-900 font-black text-lg rounded-xl hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-[0_4px_0_0_#ca8a04] active:shadow-none active:translate-y-1 uppercase tracking-wider"
            >
              Fazer Login
            </Link>
            
            <div className="flex items-center justify-center gap-2 text-xs text-green-300 font-semibold uppercase tracking-widest">
              <span>●</span>
              <span>100% Gratuito</span>
              <span>●</span>
              <span>Prêmios Reais</span>
              <span>●</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-green-400 font-medium">
          Ao entrar, você concorda com nossos <a href="#" className="underline">termos e condições</a>.
        </p>
      </div>
    </main>
  );
}
