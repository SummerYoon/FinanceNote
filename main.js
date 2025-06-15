document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    const today = new Date().toLocaleDateString("ko-KR");
    dateEl.textContent = today;
  }

  loadCategories();
  loadExpenses();
  loadIncomes();

  if (document.getElementById("expense-table-body")) {
    for (let i = 0; i < 5; i++) addExpenseRow();
  }

  if (document.getElementById("income-table-body")) {
    for (let i = 0; i < 3; i++) addIncomeRow();
  }

  const backupBtn = document.getElementById("backupButton");
  if (backupBtn) backupBtn.addEventListener("click", backupData);

  const restoreInput = document.getElementById("restoreInput");
  if (restoreInput) restoreInput.addEventListener("change", restoreData);
});

function addExpenseRow() {
  const tbody = document.getElementById("expense-table-body");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="expense-name" placeholder="내역명"></td>
    <td>
      <select class="expense-category"></select>
    </td>
    <td><input type="number" class="expense-amount" placeholder="0"></td>
  `;
  tbody.appendChild(row);
  updateCategoryDropdowns();
}

function addIncomeRow() {
  const tbody = document.getElementById("income-table-body");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="income-name" placeholder="수입 내역"></td>
    <td>
      <select class="income-category"></select>
    </td>
    <td><input type="number" class="income-amount" placeholder="0"></td>
  `;
  tbody.appendChild(row);
  updateCategoryDropdowns();
}

function loadCategories() {
  const defaultCategories = ["식비", "교통비", "기타"];
  const stored = localStorage.getItem("categories");
  if (!stored) localStorage.setItem("categories", JSON.stringify(defaultCategories));
}

function updateCategoryDropdowns() {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  document.querySelectorAll("select.expense-category, select.income-category").forEach(select => {
    select.innerHTML = categories.map(cat => `<option value="\${cat}">\${cat}</option>`).join("");
  });
}

function saveCategories(newCategory) {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  if (!categories.includes(newCategory)) {
    categories.push(newCategory);
    localStorage.setItem("categories", JSON.stringify(categories));
    updateCategoryDropdowns();
  }
}

function loadExpenses() {
  const rows = JSON.parse(localStorage.getItem("expenses") || "[]");
  const tbody = document.getElementById("expense-table-body");
  if (tbody && rows.length > 0) {
    tbody.innerHTML = "";
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="expense-name" value="\${row.name}"></td>
        <td><select class="expense-category"></select></td>
        <td><input type="number" class="expense-amount" value="\${row.amount}"></td>
      `;
      tbody.appendChild(tr);
    });
    updateCategoryDropdowns();
    document.querySelectorAll(".expense-category").forEach((sel, i) => {
      sel.value = rows[i].category;
    });
  }
}

function loadIncomes() {
  const rows = JSON.parse(localStorage.getItem("incomes") || "[]");
  const tbody = document.getElementById("income-table-body");
  if (tbody && rows.length > 0) {
    tbody.innerHTML = "";
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="income-name" value="\${row.name}"></td>
        <td><select class="income-category"></select></td>
        <td><input type="number" class="income-amount" value="\${row.amount}"></td>
      `;
      tbody.appendChild(tr);
    });
    updateCategoryDropdowns();
    document.querySelectorAll(".income-category").forEach((sel, i) => {
      sel.value = rows[i].category;
    });
  }
}

function saveAllData() {
  const expenseData = Array.from(document.querySelectorAll("#expense-table-body tr")).map(row => ({
    name: row.querySelector(".expense-name")?.value || "",
    category: row.querySelector(".expense-category")?.value || "",
    amount: parseInt(row.querySelector(".expense-amount")?.value || 0)
  }));
  localStorage.setItem("expenses", JSON.stringify(expenseData));

  const incomeData = Array.from(document.querySelectorAll("#income-table-body tr")).map(row => ({
    name: row.querySelector(".income-name")?.value || "",
    category: row.querySelector(".income-category")?.value || "",
    amount: parseInt(row.querySelector(".income-amount")?.value || 0)
  }));
  localStorage.setItem("incomes", JSON.stringify(incomeData));
}

function backupData() {
  saveAllData();
  const backup = {
    categories: localStorage.getItem("categories"),
    expenses: localStorage.getItem("expenses"),
    incomes: localStorage.getItem("incomes")
  };
  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "budget_backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.categories) localStorage.setItem("categories", data.categories);
      if (data.expenses) localStorage.setItem("expenses", data.expenses);
      if (data.incomes) localStorage.setItem("incomes", data.incomes);
      alert("복원 완료! 새로고침해주세요.");
    } catch (err) {
      alert("복원 실패: 잘못된 파일 형식입니다.");
    }
  };
  reader.readAsText(file);
}


document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetButton");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    if (confirm("정말 초기화하시겠습니까? 모든 데이터가 삭제됩니다.")) {
      localStorage.clear();
      alert("초기화 완료! 새로고침됩니다.");
      location.reload();
    }
  });

  showBudgetWarnings();
});

function getCurrentMonthKey() {
  const date = new Date();
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

function saveAllData() {
  const monthKey = getCurrentMonthKey();

  const expenseData = Array.from(document.querySelectorAll("#expense-table-body tr")).map(row => ({
    name: row.querySelector(".expense-name")?.value || "",
    category: row.querySelector(".expense-category")?.value || "",
    amount: parseInt(row.querySelector(".expense-amount")?.value || 0)
  }));
  localStorage.setItem(`expenses_${monthKey}`, JSON.stringify(expenseData));

  const incomeData = Array.from(document.querySelectorAll("#income-table-body tr")).map(row => ({
    name: row.querySelector(".income-name")?.value || "",
    category: row.querySelector(".income-category")?.value || "",
    amount: parseInt(row.querySelector(".income-amount")?.value || 0)
  }));
  localStorage.setItem(`incomes_${monthKey}`, JSON.stringify(incomeData));
}

function loadExpenses() {
  const monthKey = getCurrentMonthKey();
  const rows = JSON.parse(localStorage.getItem(`expenses_${monthKey}`) || "[]");
  const tbody = document.getElementById("expense-table-body");
  if (tbody && rows.length > 0) {
    tbody.innerHTML = "";
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="expense-name" value="\${row.name}"></td>
        <td><select class="expense-category"></select></td>
        <td><input type="number" class="expense-amount" value="\${row.amount}"></td>
      `;
      tbody.appendChild(tr);
    });
    updateCategoryDropdowns();
    document.querySelectorAll(".expense-category").forEach((sel, i) => {
      sel.value = rows[i].category;
    });
  }
}

function loadIncomes() {
  const monthKey = getCurrentMonthKey();
  const rows = JSON.parse(localStorage.getItem(`incomes_${monthKey}`) || "[]");
  const tbody = document.getElementById("income-table-body");
  if (tbody && rows.length > 0) {
    tbody.innerHTML = "";
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="income-name" value="\${row.name}"></td>
        <td><select class="income-category"></select></td>
        <td><input type="number" class="income-amount" value="\${row.amount}"></td>
      `;
      tbody.appendChild(tr);
    });
    updateCategoryDropdowns();
    document.querySelectorAll(".income-category").forEach((sel, i) => {
      sel.value = rows[i].category;
    });
  }
}

function showBudgetWarnings() {
  const monthKey = getCurrentMonthKey();
  const expenses = JSON.parse(localStorage.getItem(`expenses_${monthKey}`) || "[]");
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  const warnings = [];

  for (const cat in budgets) {
    const limit = budgets[cat];
    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    if (total > limit) {
      warnings.push(`⚠️ [${cat}] 예산 초과: 사용금액 ${total.toLocaleString()}원 / 예산 ${limit.toLocaleString()}원`);
    }
  }

  if (warnings.length && document.body) {
    const div = document.createElement("div");
    div.style.background = "#ffe5e5";
    div.style.padding = "10px";
    div.style.margin = "10px 0";
    div.innerHTML = warnings.join("<br>");
    document.body.insertBefore(div, document.body.firstChild);
  }
}