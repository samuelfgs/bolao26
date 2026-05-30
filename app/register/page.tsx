"use client";

import { signUp } from "@/lib/actions/auth";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stadium-green-800 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-full"></div>
      </div>

      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-stadium-green-600 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stadium-green-100 rounded-2xl mb-2">
            <svg className="w-10 h-10 text-stadium-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-stadium-green-800 tracking-tight uppercase italic">Criar Conta</h1>
          <p className="text-gray-500 font-medium italic">Junte-se ao time e comece seus palpites!</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-100 font-bold">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Nome Completo</label>
            <input
              name="name"
              type="text"
              placeholder="Ex: Neymar Jr"
              required
              className="block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">E-mail</label>
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Telefone</label>
            <input
              name="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              required
              className="block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Senha</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="block w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-gray-900 focus:border-stadium-green-500 focus:outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stadium-green-600 px-4 py-4 text-sm font-black text-white shadow-lg hover:bg-stadium-green-700 focus:outline-hidden focus:ring-2 focus:ring-stadium-green-500 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            {loading ? "Criando conta..." : "Criar Minha Conta"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-stadium-green-600 font-bold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
