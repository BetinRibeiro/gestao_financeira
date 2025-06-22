# 📊 Sistema de Controle Financeiro Pessoal

Projeto desenvolvido por **Rogoberto Ribeiro**  
Tecnologia utilizada: **HTML + TailwindCSS + IndexedDB + Chart.js**  
Interface moderna, 100% offline e com gráficos integrados!

---

## 📌 Funcionalidades

- ✅ Cadastro de entradas e saídas financeiras
- 📅 Navegação por mês (mês anterior / próximo mês)
- 📈 Dashboard com:
  - Total de entradas do mês
  - Total de saídas do mês
  - Contas a pagar
  - Contas a receber
- 📊 Gráficos:
  - **Fluxo financeiro mensal** (últimos 6 meses)
  - **Distribuição de despesas por classificação**
- 💾 Armazenamento local via **IndexedDB** (funciona 100% offline)
- 📤 Exportação e 📥 importação de dados em `.txt` (CSV)

---

## 🧱 Estrutura da Tabela (`registro_financeiro`)

A base de dados é local, usando IndexedDB. Cada transação possui os seguintes campos:

| Campo              | Tipo       | Descrição                                    |
|--------------------|------------|----------------------------------------------|
| `id`               | UUID       | Identificador único da transação             |
| `type`             | string     | ENTRADA ou SAIDA                             |
| `due_date`         | date       | Data de vencimento                           |
| `category`         | string     | Classificação (ex: Despesa Pessoal, Venda...)|
| `description`      | string     | Descrição livre da transação                 |
| `value`            | float      | Valor da transação                           |
| `settlement_date`  | date|null  | Data de liquidação (se houver)              |
| `settled`          | boolean    | Status (true = liquidado, false = pendente)  |
| `created_at`       | datetime   | Data/hora de criação                         |

---

## 🎨 Tecnologias e Bibliotecas

- [TailwindCSS](https://tailwindcss.com) – estilização moderna e responsiva
- [Chart.js](https://www.chartjs.org) – gráficos de barra e pizza
- [IndexedDB](https://developer.mozilla.org/pt-BR/docs/Web/API/IndexedDB_API) – banco de dados local (offline)
- [Inter Font](https://fonts.google.com/specimen/Inter) – tipografia amigável e moderna

---

## 🚀 Como Usar

1. Clone o repositório ou baixe o arquivo `financeiro.html`.
2. Abra o arquivo com um navegador moderno (Chrome, Firefox, Edge).
3. O sistema funciona **100% local**, não precisa de servidor ou internet.

---

## 🔐 Privacidade

Todos os dados ficam armazenados no navegador do seu dispositivo usando IndexedDB.  
Nenhuma informação é enviada para a nuvem ou terceiros.

---

## ✍️ Autor

**Rogoberto Ribeiro**  
Desenvolvedor independente e entusiasta de ferramentas offline eficientes.

---

## 📂 Exportação e Backup

Você pode:
- **Exportar** suas transações em `.txt` com o botão "Exportar Dados"
- **Importar** novos dados clicando em "Importar Dados" e selecionando um arquivo `.csv`/`.txt`

---

## 🛠️ Próximas Melhorias (sugestões)

- 🔍 Filtro por categoria ou valor
- 📆 Relatórios por trimestre/ano
- 📱 Versão PWA (instalável no celular)

---

## 📸 Screenshot

> *Adicione aqui um print da tela principal do sistema se quiser ilustrar visualmente.*

---

