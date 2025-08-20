// Inicializa gráfico vazio
const revenueCtx = document.getElementById("revenueChart").getContext("2d");
const revenueChart = new Chart(revenueCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Faturamento Bruto (R$)",
      data: [],
      backgroundColor: "#10B981",
      borderRadius: 4,
      borderSkipped: false,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1E40AF",
        titleFont: { weight: "bold" },
        callbacks: {
          label: function (context) {
            return "R$ " + context.raw.toLocaleString("pt-BR");
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(147, 197, 253, 0.1)" },
        ticks: {
          callback: function (value) {
            return "R$ " + (value / 1000) + "k";
          },
          color: "#93C5FD"
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#93C5FD" }
      }
    }
  }
});
function updateRevenueChart(months = 3) {
  const dbRequest = indexedDB.open("financeDB", 1);

  dbRequest.onsuccess = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("records")) return;

    const transaction = db.transaction(["records"], "readonly");
    const store = transaction.objectStore("records");
    const cursorRequest = store.openCursor();

    let monthlyRevenue = {};

    cursorRequest.onsuccess = function(event) {
      const cursor = event.target.result;

      if (cursor) {
        const record = cursor.value;

        if (record.status?.toLowerCase() === "liquidada") {
          let valorStr = String(record.valor).trim();

          // Remove R$ e espaços
          valorStr = valorStr.replace("R$", "").replace(/\s/g, "");

          // Converte formato brasileiro para decimal
          if (valorStr.includes(",")) {
            valorStr = valorStr.replace(/\.(?=\d{3},)/g, "");
            valorStr = valorStr.replace(",", ".");
          }

          const valorNumerico = parseFloat(valorStr);

          if (!isNaN(valorNumerico)) {
            const dataReferencia = record.liquidacao ? new Date(record.liquidacao) : new Date(record.liquidacao);
            const mes = dataReferencia.getMonth();
            const ano = dataReferencia.getFullYear();
            const chave = `${ano}-${mes}`;

            if (!monthlyRevenue[chave]) monthlyRevenue[chave] = 0;

            if (record.tipo === "entrada") {
              monthlyRevenue[chave] += valorNumerico;
              
            } 
            // Para saídas, pode descomentar se quiser subtrair:
            // else if (record.tipo === "saida") {
            //   monthlyRevenue[chave] -= valorNumerico;
            // }
          }
        }

        cursor.continue();
      } else {
        // Cursor acabou, monta labels e data
        const now = new Date();
        let labels = [];
        let data = [];

        for (let i = months - 1; i >= 0; i--) {
          const refDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mes = refDate.getMonth();
          const ano = refDate.getFullYear();
          const chave = `${ano}-${mes}`;
          const mesLabel = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][mes] + "/" + ano.toString().slice(-2);

          labels.push(mesLabel);
          data.push(monthlyRevenue[chave] || 0);
        }
        
        // Atualiza gráfico
        revenueChart.data.labels = labels;
        revenueChart.data.datasets[0].data = data;
        revenueChart.update();

        // Calcula total do período mostrado no gráfico
        const totalPeriodo = data.reduce((acc, val) => acc + val, 0);

        // Atualiza elemento HTML com total do período
        const totalEl = document.getElementById("totalFaturamento");
        if (totalEl) {
          totalEl.textContent = totalPeriodo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }
      }
    };

    cursorRequest.onerror = function(event) {
      console.error("Erro ao ler registros do IndexedDB:", event.target.error);
    };
  };

  dbRequest.onerror = function(event) {
    console.error("Erro ao abrir IndexedDB:", event.target.error);
  };
}


// Conecta botões para atualizar o gráfico
document.querySelectorAll(".bg-blue-800, .bg-blue-700").forEach(btn => {
  btn.addEventListener("click", function () {
    const label = this.textContent.trim();
    if (label === "12M") updateRevenueChart(12);
    if (label === "6M") updateRevenueChart(6);
    if (label === "3M") updateRevenueChart(3);
  });
});

// Carrega gráfico padrão ao iniciar (3M)
document.addEventListener("DOMContentLoaded", () => {
  updateRevenueChart(6);
});

