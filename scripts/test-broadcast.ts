
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppMessage } from "../lib/services/whatsapp";
import * as dotenv from "dotenv";

dotenv.config();

async function sendTestBroadcast() {
  console.log("🚀 Iniciando disparo de teste para fgs.samuel@gmail.com...");

  const [user] = await db.select({
    id: users.id,
    name: users.name,
    phone: users.phone,
    email: users.email,
  })
  .from(users)
  .where(eq(users.email, 'fgs.samuel@gmail.com'));

  if (!user || !user.phone) {
    console.error("❌ Usuário não encontrado ou sem telefone cadastrado.");
    process.exit(1);
  }

  const matchInfo = "🇨🇦  Canadá x Bósnia  🇧🇦  às 16:00!";

  const message = `⚽ *BOLÃO 26 - AVISO GERAL*\n\nFala, *${user.name || 'Craque'}*! \n\nPassando para lembrar que hoje tem:\n${matchInfo}\n\nMesmo que você já tenha enviado seu palpite, vale dar aquela conferida ou avisar os amigos que ainda não mandaram! 🏃💨\n\n🔗 *Acesse aqui:* ${process.env.NEXT_PUBLIC_APP_URL || 'https://bolao26-nine.vercel.app'}/palpites\n\nBoa sorte!`;

  console.log(`Enviando para ${user.name} (${user.phone})...`);
  const result = await sendWhatsAppMessage(user.phone, message);
  
  if (result?.success) {
    console.log(`✅ Sucesso: ${user.name}`);
  } else {
    console.log(`❌ Erro para ${user.name}:`, result?.error);
  }

  console.log("🏁 Teste finalizado!");
  process.exit(0);
}

sendTestBroadcast().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
