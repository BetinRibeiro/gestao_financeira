// ======================
// Gráfico de Despesas
// ======================
const expensesCtx = document.getElementById('expensesChart').getContext('2d');
const expensesChart = new Chart(expensesCtx, {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#EF4444',
        '#F59E0B',
        '#3B82F6',
        '#8B5CF6',
        '#6B7280',
        '#E5DF2D'
      ],
      borderWidth: 0,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: { padding: 20, color: '#93C5FD', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1E40AF',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${percentage}% (R$ ${value.toLocaleString('pt-BR')})`;
          }
        }
      }
    }
  }
});

// ======================
// Função de atualização por período
// ======================
function updateExpensesChart(months = 6) {
    const dbRequest = indexedDB.open("financeDB", 1);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("records")) return;

        const transaction = db.transaction(["records"], "readonly");
        const store = transaction.objectStore("records");
        const cursorRequest = store.openCursor();

        const categoryMap = {
            pagamento_mercadoria: "Pagamento Mercadoria",
            despesa_pessoal: "Despesa Pessoal",
            despesa_marketing: "Despesa Marketing",
            despesa_operacional: "Despesa Operacional",
            imposto: "Imposto",
            outro_saida: "Outra Saída"
        };

        let expensesByCategory = {};
        Object.values(categoryMap).forEach(label => expensesByCategory[label] = 0);
  const now = new Date(); // data atual

        // Data inicial: primeiro dia do mês, "months" meses atrás
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        // Data final: último dia do mês atual, até 23:59:59
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const record = cursor.value;

                if (record.status?.toLowerCase() === "liquidada" && record.tipo === "saida") {
                    let valorStr = String(record.valor).trim();
                    valorStr = valorStr.replace("R$", "").replace(/\s/g, "");
                    if (valorStr.includes(",")) {
                        valorStr = valorStr.replace(/\.(?=\d{3},)/g, "");
                        valorStr = valorStr.replace(",", ".");
                    }
                    const valorNumerico = parseFloat(valorStr);
                    if (!isNaN(valorNumerico)) {
                        const dataRef = record.liquidacao ? new Date(record.liquidacao) : new Date();
                        if ((dataRef >= startDate)&(dataRef <= endDate)) {
                            const rawCategoria = record.categoria?.toLowerCase() || "outro_saida";
                            const label = categoryMap[rawCategoria] || "Outra Saída";
                            expensesByCategory[label] += valorNumerico;
                        }
                    }
                }

                cursor.continue();
            } else {
                const labels = Object.keys(expensesByCategory);
                const data = Object.values(expensesByCategory);

                expensesChart.data.labels = labels;
                expensesChart.data.datasets[0].data = data;
                expensesChart.update();

                const totalDespesas = data.reduce((acc, val) => acc + val, 0);
                const totalEl = document.getElementById("totalDespesa");
                if (totalEl) {
                    totalEl.textContent = totalDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                }
            }
        };
    };

    dbRequest.onerror = function(event) {
        console.error("Erro ao abrir IndexedDB:", event.target.error);
    };
}


// ======================
// Controle do select
// ======================
const expensesSelect = document.getElementById('expensesPeriod');
expensesSelect.addEventListener('change', () => {
  const months = parseInt(expensesSelect.value);
  updateExpensesChart(months);
});

// ======================
// Modal para métricas
// ======================
const modal = document.getElementById('metricModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

document.querySelectorAll('[data-metric]').forEach(card => {
  card.addEventListener('click', () => {
    modalTitle.textContent = card.dataset.title;
    modalContent.textContent = card.dataset.content;
    modal.classList.remove('hidden');
  });
});

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

// ======================
// Inicialização
// ======================
document.addEventListener("DOMContentLoaded", () => {
  updateExpensesChart(parseInt(expensesSelect.value));
});
