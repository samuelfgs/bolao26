"use client";

import { useEffect, useState } from "react";
import { getPendingApprovals, updateApprovalStatus } from "@/lib/actions/admin";
import { toast } from "sonner";

export default function AdminApprovals() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    try {
      const data = await getPendingApprovals();
      setPending(data);
    } catch (e: any) {
      toast.error(e.message || "Erro ao carregar pendências");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(userId: string, poolId: string, status: "approved" | "rejected") {
    try {
      await updateApprovalStatus(userId, poolId, status);
      toast.success(status === "approved" ? "Usuário aprovado!" : "Usuário rejeitado!");
      loadPending();
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar status");
    }
  }

  return (
    <main className="min-h-screen bg-stadium-green-900 pb-20">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-stadium-yellow uppercase italic">
            Aprovação de <span className="text-white">Craques</span>
          </h1>
          <p className="text-green-100">Gerencie quem entra no campo do seu bolão.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-stadium-yellow border-t-transparent"></div>
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white/10 border-2 border-dashed border-white/20 rounded-3xl p-12 text-center">
            <p className="text-xl text-white font-medium italic">Nenhuma solicitação pendente no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((user) => (
              <div key={`${user.userId}-${user.poolId}`} className="bg-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stadium-green-100 rounded-full flex items-center justify-center text-stadium-green-800 font-black text-xl">
                    {user.userName?.split(' ')[0].charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{user.userName?.split(' ')[0] || "Sem Nome"}</h3>
                    <div className="flex flex-col text-sm text-gray-500">
                      <span>{user.userEmail}</span>
                      <span>{user.userPhone || "Sem telefone"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStatus(user.userId, user.poolId, "rejected")}
                    className="flex-1 md:flex-none px-6 py-2 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleStatus(user.userId, user.poolId, "approved")}
                    className="flex-1 md:flex-none px-6 py-2 bg-stadium-green-600 text-white font-bold rounded-xl hover:bg-stadium-green-700 shadow-md transform active:scale-95 transition-all"
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
