document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    const today = new Date().toLocaleDateString("ko-KR");
    dateEl.textContent = today;
  }

  if (document.getElementById("expense-table-body")) {
    for (let i = 0; i < 5; i++) addExpenseRow();
  }

  if (document.getElementById("income-table-body")) {
    for (let i = 0; i < 3; i++) addIncomeRow();
  }
});

function addExpenseRow() {
  const tbody = document.getElementById("expense-table-body");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="내역명"></td>
    <td>
      <select>
        <option>식비</option>
        <option>교통비</option>
        <option>기타</option>
      </select>
    </td>
    <td><input type="number" placeholder="0"></td>
  `;
  tbody.appendChild(row);
}

function addIncomeRow() {
  const tbody = document.getElementById("income-table-body");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="수입 내역"></td>
    <td>
      <select>
        <option>급여</option>
        <option>기타</option>
      </select>
    </td>
    <td><input type="number" placeholder="0"></td>
  `;
  tbody.appendChild(row);
}