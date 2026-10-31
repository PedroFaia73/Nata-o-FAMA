// Compara os tempos do Ranking do clube (index.html) com a tabela de Recordes.
// Escreve em recordes-batidos.md a lista dos tempos que batem um recorde (vazio se não houver).
const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
const pega = re => { const m = h.match(re); if (!m) throw new Error("Não encontrei " + re); return Function(`"use strict"; return (${m[1]});`)(); };
const recordes = pega(/const recordes = (\{[\s\S]*?\n\});/);
const ranking = pega(/const ranking = (\[[\s\S]*?\n\]);/);
const rkProvas = pega(/const rkProvas = (\[.*?\]);/);
const seg = t => String(t).trim().replace(",", ".").split(":").reduce((a, x) => a * 60 + parseFloat(x), 0);
const melhor = new Map(); // só o tempo mais rápido de cada prova/género/piscina
for (const r of ranking) {
  const pool = r[6] === "25m" ? "p25" : "p50", g = r[0] % 2, prova = rkProvas[r[1]];
  const row = recordes[pool].rows.find(x => x[0] === prova);
  if (!row) continue;
  const rec = g ? row[6] : row[3], dono = g ? row[7] : row[1];
  const k = [pool, g, prova].join("|");
  if (!(seg(r[5]) < seg(rec) - 0.001) || (melhor.has(k) && seg(melhor.get(k).t) <= seg(r[5]))) continue;
  melhor.set(k, { t: r[5], txt: `- **${prova}** ${g ? "femininos" : "masculinos"}, piscina de ${pool === "p25" ? "25" : "50"} m: ${r[3]} nadou **${r[5]}** em ${r[7]} (${r[8]}). O recorde era ${rec} (${dono}).` });
}
const linhas = [...melhor.values()].map(x => x.txt);
fs.writeFileSync("recordes-batidos.md", linhas.join("\n"));
console.log(linhas.length ? linhas.join("\n") : "Nenhum recorde batido.");
