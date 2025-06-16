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
  if (!tbody) return;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="expense-name" placeholder="내역명"></td>
    <td><select class="expense-category"></select></td>
    <td><input type="number" class="expense-amount" placeholder="0"></td>
  `;
  tbody.appendChild(row);
  updateCategoryDropdowns();
}

function addIncomeRow() {
  const tbody = document.getElementById("income-table-body");
  if (!tbody) return;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="income-name" placeholder="수입명"></td>
    <td><select class="income-category"></select></td>
    <td><input type="number" class="income-amount" placeholder="0"></td>
  `;
  tbody.appendChild(row);
  updateCategoryDropdowns();
}

function updateCategoryDropdowns() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const fullList = ["카테고리 없음", ...cats];
  document.querySelectorAll("select.expense-category, select.income-category").forEach(select => {
    const current = select.value;
    select.innerHTML = fullList.map(cat => `<option value="\${cat}">\${cat}</option>`).join("");
    select.value = fullList.includes(current) ? current : "카테고리 없음";
  });
}

function renderCategories() {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const container = document.getElementById("category-list");
  if (!container) return;
  container.innerHTML = "";

  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "8px";

  categories.forEach(cat => {
    const catWrap = document.createElement("span");
    catWrap.style.display = "inline-flex";
    catWrap.style.alignItems = "center";

    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.disabled = true;
    btn.style.backgroundColor = "#4da6ff";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "6px 12px";
    btn.style.borderRadius = "16px";
    btn.style.fontSize = "14px";

    const del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "4px";
    del.style.fontSize = "10px";
    del.onclick = () => {
      if (confirm(`정말 [\${cat}] 카테고리를 삭제하시겠습니까?`)) {
        removeCategory(cat);
      }
    };

    catWrap.appendChild(btn);
    catWrap.appendChild(del);
    container.appendChild(catWrap);
  });
}

function removeCategory(catToRemove) {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").filter(c => c !== catToRemove);
  localStorage.setItem("categories", JSON.stringify(categories));

  const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
  delete budgets[catToRemove];
  localStorage.setItem("budgets", JSON.stringify(budgets));

  for (let key in localStorage) {
    if (key.startsWith("expenses_") || key.startsWith("income_")) {
      const data = JSON.parse(localStorage.getItem(key));
      data.forEach(item => {
        if (!item.category || item.category === catToRemove) {
          item.category = "카테고리 없음";
        }
      });
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  renderCategories();
  updateCategoryDropdowns();
}