
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

// Exemplo de endDate para usar junto:
function getEndDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // último dia do mês atual, 23:59:59.999
}


function updateFaturamento(period = "trimestral") {
    
  const startDate = getStartDate(period);
  let endDate = new Date(); // sua data de referência
  endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);   

  const dbRequest = indexedDB.open("financeDB", 1);

  dbRequest.onerror = () => alert("Erro ao abrir o banco de dados.");

  dbRequest.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("records")) {
      db.createObjectStore("records", { keyPath: "id", autoIncrement: true });
    }
  };

  dbRequest.onsuccess = function(event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("records")) return;

    const transaction = db.transaction(["records"], "readonly");
    const store = transaction.objectStore("records");

    let totalFaturamento = 0;
    let totalDespesas = 0;

    const cursorRequest = store.openCursor();

    cursorRequest.onerror = () => alert("Erro ao abrir cursor no object store.");

    cursorRequest.onsuccess = function(event) {
      const cursor = event.target.result;

      if (cursor) {
        const record = cursor.value;

        // Pula se não houver data de liquidação
        if (!record.liquidacao) {
          cursor.continue();
          return;
        }

        const dataReferencia = new Date(record.liquidacao);
        if (dataReferencia >= startDate && dataReferencia <= endDate && record.status?.toLowerCase() === "liquidada") {
            
          // Converte valor brasileiro para número
          let valorStr = String(record.valor).trim();
          valorStr = valorStr.replace("R$", "").replace(/\s/g, "");
          if (valorStr.includes(",")) {
            valorStr = valorStr.replace(/\.(?=\d{3},)/g, "").replace(",", ".");
          }
            const valorNumerico = parseFloat(valorStr);
            const dia = String(dataReferencia.getDate()).padStart(2, '0');
            const mes = String(dataReferencia.getMonth() + 1).padStart(2, '0');
            const ano = dataReferencia.getFullYear();
            const dataFormatada = `${dia}/${mes}/${ano}`;

        
          if (!isNaN(valorNumerico)) {
            if (record.tipo === "entrada") totalFaturamento += valorNumerico;
            else if (record.tipo === "saida") totalDespesas += valorNumerico;
            
          }
        }

        cursor.continue();
      } else {
        // Cursor finalizado → atualiza a tela
        const faturamentoEl = document.querySelector('[data-metric="faturamento"] h2');
        const despesasEl = document.querySelector('[data-metric="despesas"] h2');
        const lucroEl = document.querySelector('[data-metric="lucro"] h2');
        const margemEl = document.querySelector('[data-metric="margem"] h2');

        if (faturamentoEl) faturamentoEl.textContent = totalFaturamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        if (despesasEl) despesasEl.textContent = totalDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        const lucro = totalFaturamento - totalDespesas;
        if (lucroEl) lucroEl.textContent = lucro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        const margem = totalFaturamento > 0 ? ((lucro / totalFaturamento) * 100).toFixed(1) : 0;
        if (margemEl) margemEl.textContent = margem + " %";
      }
    };
  };
}

// Atualiza métricas ao mudar o select
document.getElementById("periodo-select")?.addEventListener("change", function() {
  updateFaturamento(this.value.toLowerCase());
});

// Atualiza na carga da página
document.addEventListener("DOMContentLoaded", () => updateFaturamento("semestral"));
