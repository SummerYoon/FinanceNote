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

// 카테고리 추가
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

// 예산 저장
function saveBudget() {
  const category = document.getElementById("budget-category").value;
  const amount = parseInt(document.getElementById("budget-amount").value || "0");
  if (!category || isNaN(amount)) return;

  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  budgets[category] = amount;
  localStorage.setItem("budgets", JSON.stringify(budgets));
  loadBudgets();
}

// 카테고리 목록 로드
function loadCategories() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const tbody = document.getElementById("category-table-body");
  if (tbody) {
    tbody.innerHTML = "";
    cats.forEach(cat => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>\${cat}</td>`;
      tbody.appendChild(tr);
    });
  }
}

// 예산 목록 로드
function loadBudgets() {
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  const tbody = document.getElementById("budget-table-body");
  if (tbody) {
    tbody.innerHTML = "";
    for (const [cat, amt] of Object.entries(budgets)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>\${cat}</td><td>\${amt.toLocaleString()} 원</td>`;
      tbody.appendChild(tr);
    }
  }
}

// 카테고리 드롭다운에 반영
function updateDropdowns() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const select = document.getElementById("budget-category");
  if (select) {
    select.innerHTML = cats.map(cat => `<option>\${cat}</option>`).join("");
  }
}

// 백업
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

// 복원
function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.categories) localStorage.setItem("categories", data.categories);
      if (data.budgets) localStorage.setItem("budgets", data.budgets);
      alert("복원 완료! 새로고침됩니다.");
      location.reload();
    } catch {
      alert("잘못된 파일 형식입니다.");
    }
  };
  reader.readAsText(file);
}