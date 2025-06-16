(function() {
  const categoryKey = 'categories';
  const expenseKey = 'dailyExpenses';
  const today = new Date().toISOString().split('T')[0];

  function getCategories() {
    return JSON.parse(localStorage.getItem(categoryKey) || '[]');
  }

  function saveCategories(categories) {
    localStorage.setItem(categoryKey, JSON.stringify(categories));
  }

  function renderCategories() {
    const list = document.getElementById('category-list');
    if (list) {
      list.innerHTML = '';
      getCategories().forEach((cat, i) => {
        const li = document.createElement('li');
        li.textContent = cat + ' ';
        const delBtn = document.createElement('button');
        delBtn.textContent = '삭제';
        delBtn.onclick = () => {
          const cats = getCategories();
          cats.splice(i, 1);
          saveCategories(cats);
          renderCategories();
        };
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    }
  }

  const addCatBtn = document.getElementById('add-category');
  if (addCatBtn) {
    addCatBtn.onclick = () => {
      const input = document.getElementById('new-category-input');
      const val = input.value.trim();
      if (!val) return;
      const cats = getCategories();
      if (!cats.includes(val)) {
        cats.push(val);
        saveCategories(cats);
        input.value = '';
        renderCategories();
      }
    };
    renderCategories();
  }

  function renderInputRows() {
    const rows = document.getElementById('expense-rows');
    if (!rows) return;
    rows.innerHTML = '';
    for (let i = 0; i < 5; i++) rows.appendChild(createRow());
  }

  function createRow() {
    const div = document.createElement('div');
    div.className = 'expense-row';

    const name = document.createElement('input');
    name.placeholder = '내역';
    name.className = 'exp-name';

    const cat = document.createElement('select');
    cat.className = 'exp-cat';
    getCategories().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      cat.appendChild(opt);
    });

    const amt = document.createElement('input');
    amt.placeholder = '금액';
    amt.type = 'number';
    amt.className = 'exp-amt';

    div.appendChild(name);
    div.appendChild(cat);
    div.appendChild(amt);
    return div;
  }

  const addRowBtn = document.getElementById('add-row');
  if (addRowBtn) {
    addRowBtn.onclick = () => {
      const rows = document.getElementById('expense-rows');
      rows.appendChild(createRow());
    };
    renderInputRows();
  }

  const saveBtn = document.getElementById('save-expenses');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const entries = [];
      document.querySelectorAll('.expense-row').forEach(row => {
        const name = row.querySelector('.exp-name').value.trim();
        const cat = row.querySelector('.exp-cat').value;
        const amt = parseInt(row.querySelector('.exp-amt').value);
        if (name && cat && amt) {
          entries.push({ name, category: cat, amount: amt });
        }
      });
      const data = JSON.parse(localStorage.getItem(expenseKey) || '{}');
      data[today] = entries;
      localStorage.setItem(expenseKey, JSON.stringify(data));
      renderSavedExpenses();
    };
  }

  function renderSavedExpenses() {
    const container = document.getElementById('saved-expenses');
    if (!container) return;
    const data = JSON.parse(localStorage.getItem(expenseKey) || '{}');
    const entries = data[today] || [];
    container.innerHTML = '<table><tr><th>내역</th><th>카테고리</th><th>금액</th></tr>' +
      entries.map(e => `<tr><td>${e.name}</td><td>${e.category}</td><td>${e.amount.toLocaleString()}원</td></tr>`).join('') +
      '</table>';
  }

  if (document.getElementById('saved-expenses')) renderSavedExpenses();

  const analysisTable = document.getElementById('monthly-analysis');
  if (analysisTable) {
    const data = JSON.parse(localStorage.getItem(expenseKey) || '{}');
    const monthly = {};
    for (const date in data) {
      const month = date.slice(0, 7);
      if (!monthly[month]) monthly[month] = {};
      data[date].forEach(e => {
        if (!monthly[month][e.category]) monthly[month][e.category] = 0;
        monthly[month][e.category] += e.amount;
      });
    }
    const months = Object.keys(monthly).sort();
    const cats = [...new Set(months.flatMap(m => Object.keys(monthly[m])))];
    analysisTable.innerHTML = '<tr><th>카테고리</th>' + months.map(m => `<th>${m}</th>`).join('') + '</tr>' +
      cats.map(cat => '<tr><td>' + cat + '</td>' + months.map(m => `<td>${(monthly[m][cat] || 0).toLocaleString()}</td>`).join('') + '</tr>').join('');
  }
})();