document.addEventListener("DOMContentLoaded", () => {
  const page = location.pathname;
  if (page.includes("index.html")) {
    renderToday();
    for (let i = 0; i < 5; i++) addExpenseRow();
  } else if (page.includes("income.html")) {
    for (let i = 0; i < 3; i++) addIncomeRow();
  } else if (page.includes("setup.html")) {
    renderCategories();
    renderBudgets();
  } else if (page.includes("analize.html")) {
    loadAnalysisTable();
  }
});

function renderToday() {
  const today = new Date();
  const dateStr = today.getFullYear() + ". " + (today.getMonth() + 1) + ". " + today.getDate() + ".";
  const dateSpan = document.getElementById("today-date");
  if (dateSpan) dateSpan.textContent = dateStr;
}

function addExpenseRow() {
  const tbody = document.getElementById("expense-table-body");
  const row = document.createElement("tr");
  row.innerHTML = \`
    <td><input type="text" class="expense-name" placeholder="내역명"></td>
    <td><select class="expense-category"></select></td>
    <td><input type="number" class="expense-amount" placeholder="0"></td>
  \`;
  tbody.appendChild(row);
  updateCategoryDropdowns();
}

function addIncomeRow() {
  const tbody = document.getElementById("income-table-body");
  const row = document.createElement("tr");
  row.innerHTML = \`
    <td><input type="text" class="income-name" placeholder="수입명"></td>
    <td><select class="income-category"></select></td>
    <td><input type="number" class="income-amount" placeholder="0"></td>
  \`;
  tbody.appendChild(row);
  updateCategoryDropdowns();
}

function renderCategories() {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const container = document.getElementById("category-list");
  container.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.disabled = true;
    btn.style.marginRight = "8px";
    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = () => removeCategory(cat);
    const wrap = document.createElement("span");
    wrap.appendChild(btn);
    wrap.appendChild(del);
    container.appendChild(wrap);
  });
}

function removeCategory(catToRemove) {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").filter(c => c !== catToRemove);
  localStorage.setItem("categories", JSON.stringify(categories));

  // budgets 정리
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  delete budgets[catToRemove];
  localStorage.setItem("budgets", JSON.stringify(budgets));

  // expenses 교체
  for (let key in localStorage) {
    if (key.startsWith("expenses_")) {
      const data = JSON.parse(localStorage.getItem(key));
      data.forEach(item => {
        if (item.category === catToRemove || !item.category) {
          item.category = "카테고리 없음";
        }
      });
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  renderCategories();
  updateCategoryDropdowns();
}

function addNewCategory() {
  const input = document.getElementById("new-category-input");
  const newCat = input.value.trim();
  if (!newCat) return;
  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  if (!categories.includes(newCat)) {
    categories.push(newCat);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
    updateCategoryDropdowns();
  }
  input.value = "";
}

function saveTodayExpenses() {
  const rows = document.querySelectorAll("#expense-table-body tr");
  const data = [];
  rows.forEach(row => {
    const name = row.querySelector(".expense-name")?.value || row.children[0].querySelector("input").value;
    const category = row.querySelector(".expense-category")?.value || row.children[1].querySelector("select").value;
    const amount = parseInt(row.querySelector(".expense-amount")?.value || row.children[2].querySelector("input").value) || 0;
    if (name && category) {
      data.push({ name, category, amount });
    }
  });

  const today = new Date();
  const monthKey = "expenses_" + today.toISOString().slice(0, 7); // "expenses_2025-06"
  const existing = JSON.parse(localStorage.getItem(monthKey) || "[]");
  localStorage.setItem(monthKey, JSON.stringify(existing.concat(data)));

  alert("저장되었습니다!");
}

function loadThisMonthExpenses() {
  const monthKey = "expenses_" + new Date().toISOString().slice(0, 7);
  const data = JSON.parse(localStorage.getItem(monthKey) || "[]");

  const container = document.getElementById("monthly-details");
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = "<p>이번달 소비 내역이 없습니다.</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = \`
    <thead><tr><th>날짜</th><th>항목</th><th>카테고리</th><th>금액</th></tr></thead>
    <tbody>\${data.map(d => \`
      <tr>
        <td>\${new Date().toLocaleDateString("ko-KR")}</td>
        <td>\${d.name}</td>
        <td>\${d.category}</td>
        <td>\${d.amount.toLocaleString()}원</td>
      </tr>\`).join("")}</tbody>
  \`;
  container.innerHTML = "<h3>이번달 소비 내역</h3>";
  container.appendChild(table);
}

// Ensure '카테고리 없음' is always present
function ensureDefaultCategory() {
  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  if (!categories.includes("카테고리 없음")) {
    categories.unshift("카테고리 없음");
    localStorage.setItem("categories", JSON.stringify(categories));
  }
}

function addNewCategory() {
  const input = document.getElementById("new-category-input");
  const newCat = input.value.trim();
  if (!newCat || newCat === "카테고리 없음") return;

  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  if (!categories.includes(newCat)) {
    categories.push(newCat);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
    updateCategoryDropdowns();
  }
  input.value = "";
}

function removeCategory(catToRemove) {
  if (catToRemove === "카테고리 없음") return;

  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  categories = categories.filter(c => c !== catToRemove);
  localStorage.setItem("categories", JSON.stringify(categories));

  // Remove related budget
  let budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  delete budgets[catToRemove];
  localStorage.setItem("budgets", JSON.stringify(budgets));

  // Reassign category in data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("expenses_") || key.startsWith("income_")) {
      const records = JSON.parse(localStorage.getItem(key) || "[]");
      records.forEach(r => {
        if (r.category === catToRemove) {
          r.category = "카테고리 없음";
        }
      });
      localStorage.setItem(key, JSON.stringify(records));
    }
  });

  renderCategories();
  updateCategoryDropdowns();
}

function updateCategoryDropdowns() {
  ensureDefaultCategory();
  const selects = document.querySelectorAll("select.category-dropdown");
  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  selects.forEach(select => {
    select.innerHTML = "";
    categories.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  });
}


  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  budgets[category] = amount;
  localStorage.setItem("budgets", JSON.stringify(budgets));

  amountInput.value = "";
  renderBudgets();
}

}

function saveBudget() {
  const catSelect = document.getElementById("budget-category");
  const amountInput = document.getElementById("budget-amount");

  const category = catSelect?.value || "";
  const amount = parseInt(amountInput?.value || "0");

  if (!category || isNaN(amount) || amount <= 0) {
    alert("올바른 카테고리와 금액을 입력해주세요.");
    return;
  }

  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  budgets[category] = amount;
  localStorage.setItem("budgets", JSON.stringify(budgets));

  amountInput.value = "";
  renderBudgets();
}

function renderBudgets() {
  const tbody = document.getElementById("budget-table-body");
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");

  if (!tbody) return;
  tbody.innerHTML = "";

  for (const cat in budgets) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cat}</td>
      <td>${budgets[cat].toLocaleString()}원</td>
      <td><button onclick="deleteBudget('${cat}')">❌</button></td>
    `;
    tbody.appendChild(tr);
  }
}

function deleteBudget(cat) {
  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  delete budgets[cat];
  localStorage.setItem("budgets", JSON.stringify(budgets));
  renderBudgets();
}