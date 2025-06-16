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

function updateCategoryDropdowns() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const fullList = ["카테고리 없음", ...cats];
  document.querySelectorAll("select.expense-category, select.income-category").forEach(select => {
    const current = select.value;
    select.innerHTML = fullList.map(cat => \`<option value="\${cat}">\${cat}</option>\`).join("");
    select.value = fullList.includes(current) ? current : "카테고리 없음";
  });
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