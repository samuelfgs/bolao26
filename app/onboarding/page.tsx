"use client";

import { useState } from "react";
import { createPool, joinPool } from "@/lib/actions/pool";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      const { code } = await createPool(name);
      alert(`Bolão criado! Código: ${code}`);
      router.push("/dashboard");
    } catch (e) {
      alert("Erro ao criar bolão");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setLoading(true);
    try {
      await joinPool(code);
      router.push("/dashboard");
    } catch (e) {
      alert("Código inválido ou erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "choice") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
        <h1 className="text-3xl font-bold">Bem-vindo ao Bolão 2026</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setMode("create")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Criar um novo Bolão
          </button>
          <button
            onClick={() => setMode("join")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Entrar em um Bolão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">
        {mode === "create" ? "Criar Bolão" : "Entrar no Bolão"}
      </h1>
      <input
        type="text"
        placeholder={mode === "create" ? "Nome do Bolão" : "Código de Convite"}
        className="px-4 py-2 border rounded-md"
        value={mode === "create" ? name : code}
        onChange={(e) => mode === "create" ? setName(e.target.value) : setCode(e.target.value)}
      />
      <button
        onClick={mode === "create" ? handleCreate : handleJoin}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {loading ? "Processando..." : "Confirmar"}
      </button>
      <button onClick={() => setMode("choice")} className="text-sm text-gray-500 underline">
        Voltar
      </button>
    </div>
  );
}
