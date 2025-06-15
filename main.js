document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadBudgets();
  updateDropdowns();

  document.getElementById("backupButton")?.addEventListener("click", backupData);
  document.getElementById("restoreInput")?.addEventListener("change", restoreData);
  document.getElementById("resetButton")?.addEventListener("click", () => {
    if (confirm("정말 초기화하시겠습니까?")) {
      localStorage.clear();
      location.reload();
    }
  });
});

function addNewCategory() {
  const input = document.getElementById("new-category-input");
  const newCat = input.value.trim();
  if (!newCat) return;
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  if (!cats.includes(newCat)) {
    cats.push(newCat);
    localStorage.setItem("categories", JSON.stringify(cats));
    input.value = "";
    loadCategories();
    updateDropdowns();
  }
}

function saveBudget() {
  const category = document.getElementById("budget-category").value;
  const amount = parseInt(document.getElementById("budget-amount").value || "0");
  if (!category || isNaN(amount)) return;

  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  budgets[category] = amount;
  localStorage.setItem("budgets", JSON.stringify(budgets));
  loadBudgets();
}

function loadCategories() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const tbody = document.getElementById("category-table-body");
  if (tbody) {
    tbody.innerHTML = "";
    cats.forEach(cat => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${cat}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function loadBudgets() {
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  const tbody = document.getElementById("budget-table-body");
  if (tbody) {
    tbody.innerHTML = "";
    for (const [cat, amt] of Object.entries(budgets)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${cat}</td><td>${amt.toLocaleString()} 원</td>`;
      tbody.appendChild(tr);
    }
  }
}

function updateDropdowns() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const select = document.getElementById("budget-category");
  if (select) {
    select.innerHTML = cats.map(cat => `<option>${cat}</option>`).join("");
  }

  // 소비/수입 입력 페이지의 드롭다운도 같이 반영
  document.querySelectorAll("select.expense-category, select.income-category").forEach(select => {
    select.innerHTML = cats.map(cat => `<option>${cat}</option>`).join("");
  });
}

function backupData() {
  const data = {
    categories: localStorage.getItem("categories"),
    budgets: localStorage.getItem("budgets")
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
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
      if (data.categories) localStorage.setItem("categories", JSON.stringify(data.categories));
      if (data.budgets) localStorage.setItem("budgets", JSON.stringify(data.budgets));
      alert("복원 완료! 새로고침됩니다.");
      location.reload();
    } catch {
      alert("잘못된 파일 형식입니다.");
    }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("analysis-table-body")) {
    loadAnalysisTable();
  }
});

function loadAnalysisTable() {
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const expenses = JSON.parse(localStorage.getItem(`expenses_${monthKey}`) || "[]");
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");

  const usageByCategory = {};

  // 카테고리별 사용 금액 합산
  expenses.forEach(exp => {
    if (!usageByCategory[exp.category]) usageByCategory[exp.category] = 0;
    usageByCategory[exp.category] += exp.amount || 0;
  });

  const tbody = document.getElementById("analysis-table-body");
  tbody.innerHTML = "";

  // 분석 테이블 채우기
  Object.keys(budgets).forEach(cat => {
    const used = usageByCategory[cat] || 0;
    const budget = budgets[cat];
    const remain = budget - used;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cat}</td>
      <td>${used.toLocaleString()}원</td>
      <td>${budget.toLocaleString()}원</td>
      <td>${remain.toLocaleString()}원</td>
    `;
    tbody.appendChild(tr);
  });
}

function loadAnalysisTable() {
  const monthKey = new Date().toISOString().slice(0, 7);
  const expenses = JSON.parse(localStorage.getItem(`expenses_${monthKey}`) || "[]");
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");

  const usageByCategory = {};
  expenses.forEach(exp => {
    if (!usageByCategory[exp.category]) usageByCategory[exp.category] = 0;
    usageByCategory[exp.category] += exp.amount || 0;
  });

  const tbody = document.getElementById("analysis-table-body");
  tbody.innerHTML = "";

  let totalUsed = 0, totalBudget = 0;

  for (const cat in budgets) {
    const used = usageByCategory[cat] || 0;
    const budget = budgets[cat];
    const remain = budget - used;

    totalUsed += used;
    totalBudget += budget;

    const tr = document.createElement("tr");
    if (remain < 0) tr.style.backgroundColor = "#ffe0e0";

    tr.innerHTML = `
      <td>${cat}</td>
      <td>${used.toLocaleString()}원</td>
      <td>${budget.toLocaleString()}원</td>
      <td>${remain.toLocaleString()}원</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById("total-used").textContent = totalUsed.toLocaleString() + "원";
  document.getElementById("total-budget").textContent = totalBudget.toLocaleString() + "원";
  document.getElementById("total-remaining").textContent = (totalBudget - totalUsed).toLocaleString() + "원";
  document.getElementById("current-month").textContent = monthKey;

  renderDonutChart(usageByCategory);
}

function renderDonutChart(dataObj) {
  const ctx = document.getElementById('donutChart').getContext('2d');
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);
  if (window.donutChart) window.donutChart.destroy();
  window.donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}