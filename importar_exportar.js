// Dependência para gerar UUID
function generateUUID() { // Simples UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

// Abrir IndexedDB
function openDB(callback) {
  const request = indexedDB.open("financeDB", 1);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("records")) {
      db.createObjectStore("records", { keyPath: "uuid" });
    }
  };
  request.onsuccess = (event) => callback(event.target.result);
  request.onerror = (event) => console.error("Erro IndexedDB:", event.target.error);
}

// ================== IMPORTAR CSV ==================
document.getElementById("importCSV").addEventListener("click", () => {
  document.getElementById("csvFileInput").click();
});

document.getElementById("csvFileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const text = event.target.result;
    const lines = text.split(/\r?\n/);
    const headers = lines[0].split(",");

    openDB((db) => {
      const transaction = db.transaction("records", "readwrite");
      const store = transaction.objectStore("records");

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",");
        let record = {};
        headers.forEach((h, idx) => record[h.trim()] = values[idx].trim());

        // Garante uuid
        if (!record.uuid) record.uuid = generateUUID();

        // Verifica duplicado: se existir, atualiza; se não, adiciona
        const getRequest = store.get(record.uuid);
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            store.put(record); // Atualiza
          } else {
            store.add(record); // Insere
          }
        };
      }

      transaction.oncomplete = () => alert("Importação concluída!");
    });
  };
  reader.readAsText(file);
});

// ================== EXPORTAR CSV ==================
document.getElementById("exportCSV").addEventListener("click", () => {
  openDB((db) => {
    const transaction = db.transaction("records", "readonly");
    const store = transaction.objectStore("records");
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result;
      if (!records.length) return alert("Nenhum registro para exportar.");

      const headers = Object.keys(records[0]);
      const csv = [
        headers.join(","), // cabeçalho
        ...records.map(r => headers.map(h => r[h] || "").join(","))
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "finance_records.csv";
      a.click();
      URL.revokeObjectURL(url);
    };
  });
});
