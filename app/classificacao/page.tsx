export default function ClassificacaoPage() {
  const groups = [
    { name: "Grupo A", teams: ["Brasil", "França", "Egito", "Canadá"] },
    { name: "Grupo B", teams: ["Argentina", "Espanha", "Japão", "Nigéria"] },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Classificação Oficial - Copa 2026</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {groups.map((group) => (
          <div key={group.name} className="border rounded-xl overflow-hidden">
            <div className="bg-gray-100 p-3 font-bold border-b">{group.name}</div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b">
                  <th className="p-3">Pos</th>
                  <th className="p-3">Seleção</th>
                  <th className="p-3">P</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, idx) => (
                  <tr key={team} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-medium">{team}</td>
                    <td className="p-3">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold">Chaveamento Mata-Mata</h2>
        <div className="p-8 border rounded-xl bg-gray-50 text-center text-gray-500 italic">
          O chaveamento será liberado após o fim da fase de grupos.
        </div>
      </div>
    </div>
  );
}
