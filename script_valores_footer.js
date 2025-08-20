
function getStartDate(period) {
  const now = new Date();
  let start;

  switch (period) {
    case "trimestral":
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      break;
    case "semestral":
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
      break;
    case "anual":
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  return start;
}

function getEndDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

function updateContas(period = "semestral") {
  const startDate = getStartDate(period);
  const endDate = getEndDate();

  const dbRequest = indexedDB.open("financeDB", 1);

  dbRequest.onerror = () => alert("Erro ao abrir o banco de dados.");

  dbRequest.onsuccess = function(event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("records")) return;

    const transaction = db.transaction(["records"], "readonly");
    const store = transaction.objectStore("records");

    let totalReceber = 0;
    let totalPagar = 0;

    const cursorRequest = store.openCursor();

    cursorRequest.onerror = () => alert("Erro ao abrir cursor no object store.");

    cursorRequest.onsuccess = function(event) {
      const cursor = event.target.result;

      if (cursor) {
        const record = cursor.value;

          if (record.status?.toLowerCase() != "liquidada") {
        console.log(`| ${record.tipo} | ${record.valor} | ${record.dataReferencia} | ${record.categoria || "N/A"} | ${record.status} |`);
        
            // Converter valor string → número
            let valorStr = String(record.valor).trim();
            valorStr = valorStr.replace("R$", "").replace(/\s/g, "");
            if (valorStr.includes(",")) {
              valorStr = valorStr.replace(/\.(?=\d{3},)/g, "").replace(",", ".");
            }
            const valorNum = parseFloat(valorStr);

            if (!isNaN(valorNum)) {
              if (record.tipo === "entrada") totalReceber += valorNum;
              else if (record.tipo === "saida") totalPagar += valorNum;
            }
          }

        cursor.continue();
      } else {
        // Atualiza DOM
        const receberEl = document.getElementById("contasReceber");
        const pagarEl = document.getElementById("contasPagar");
        const saldoEl = document.getElementById("saldoProjetado");

        if (receberEl) receberEl.textContent = totalReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        if (pagarEl) pagarEl.textContent = totalPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        const saldo = totalReceber - totalPagar;
        if (saldoEl) saldoEl.textContent = saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      }
    };
  };
}

// Troca período via select
document.getElementById("periodo-select")?.addEventListener("change", function() {
  updateContas(this.value.toLowerCase());
});

// Atualiza na carga da página
document.addEventListener("DOMContentLoaded", () => updateContas("semestral"));
