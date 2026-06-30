document.addEventListener('DOMContentLoaded', () => {
    Historico.init();
});

const Historico = {
    selectedExpenseId: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.resetFilters();
        this.render();
    },

    cacheDOM() {
        this.filterSearch = document.getElementById('filter-search');
        this.filterCategory = document.getElementById('filter-category');
        this.filterMonth = document.getElementById('filter-month');
        this.btnClearFilters = document.getElementById('btn-clear-filters');

        this.tableBody = document.getElementById('expenses-table-body');
        this.categoryTotalsSummary = document.getElementById('category-totals-summary');

        this.btnNewExpense = document.getElementById('btn-add-expense-trigger');
        this.modalExpenseOverlay = document.getElementById('modal-expense-overlay');
        this.modalExpenseClose = document.getElementById('modal-expense-close');
        this.btnCancelExpense = document.getElementById('btn-cancel-expense');
        this.formExpense = document.getElementById('form-expense');

        this.modalConfirmOverlay = document.getElementById('modal-confirm-overlay');
        this.modalConfirmClose = document.getElementById('modal-confirm-close');
        this.btnConfirmCancel = document.getElementById('btn-confirm-cancel');
        this.btnConfirmDelete = document.getElementById('btn-confirm-delete');
        this.deleteExpenseTitle = document.getElementById('delete-expense-title');
    },

    bindEvents() {
        this.filterSearch.addEventListener('input', () => this.render());
        this.filterCategory.addEventListener('change', () => this.render());
        this.filterMonth.addEventListener('change', () => this.render());
        this.btnClearFilters.addEventListener('click', () => {
            this.resetFilters();
            this.render();
        });

        this.btnNewExpense.addEventListener('click', () => this.openExpenseModal());
        this.modalExpenseClose.addEventListener('click', () => this.closeExpenseModal());
        this.btnCancelExpense.addEventListener('click', () => this.closeExpenseModal());
        this.formExpense.addEventListener('submit', (e) => this.handleExpenseSubmit(e));

        this.modalConfirmClose.addEventListener('click', () => this.closeConfirmModal());
        this.btnConfirmCancel.addEventListener('click', () => this.closeConfirmModal());
        this.btnConfirmDelete.addEventListener('click', () => this.handleDeleteConfirm());
    },

    resetFilters() {
        this.filterSearch.value = '';
        this.filterCategory.value = '';
        this.filterMonth.value = '';
    },

    openExpenseModal(expense = null) {
        this.formExpense.reset();

        if (expense) {
            document.getElementById('expense-id').value = expense.id;
            document.getElementById('expense-desc').value = expense.description;
            document.getElementById('expense-value').value = expense.value;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-date').value = expense.date;
            document.getElementById('modal-title').textContent = 'Editar Gasto';
        } else {
            document.getElementById('expense-id').value = '';
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('expense-date').value = today;
            document.getElementById('modal-title').textContent = 'Adicionar Novo Gasto';
        }

        this.modalExpenseOverlay.classList.add('active');
    },

    closeExpenseModal() {
        this.modalExpenseOverlay.classList.remove('active');
    },

    openConfirmModal(id, description) {
        this.selectedExpenseId = id;
        this.deleteExpenseTitle.textContent = description;
        this.modalConfirmOverlay.classList.add('active');
    },

    closeConfirmModal() {
        this.modalConfirmOverlay.classList.remove('active');
        this.selectedExpenseId = null;
    },

    handleExpenseSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('expense-id').value;
        const description = document.getElementById('expense-desc').value.trim();
        const value = parseFloat(document.getElementById('expense-value').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (!description || isNaN(value) || value <= 0 || !category || !date) {
            App.showToast('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }

        const expenseData = { id, description, value, category, date };

        if (id) {
            StorageManager.updateExpense(expenseData);
            App.showToast('Gasto atualizado com sucesso!');
        } else {
            StorageManager.addExpense(expenseData);
            App.showToast('Gasto adicionado com sucesso!');
        }

        this.closeExpenseModal();
        this.render();
    },

    handleDeleteConfirm() {
        if (this.selectedExpenseId) {
            const success = StorageManager.deleteExpense(this.selectedExpenseId);
            if (success) {
                App.showToast('Gasto excluído com sucesso!');
            } else {
                App.showToast('Erro ao excluir o gasto.', 'error');
            }
            this.closeConfirmModal();
            this.render();
        }
    },

    render() {
        const expenses = StorageManager.getExpenses();
        const query = this.filterSearch.value.toLowerCase().trim();
        const categoryFilter = this.filterCategory.value;
        const monthFilter = this.filterMonth.value;

        const filtered = expenses.filter(exp => {
            const matchQuery = exp.description.toLowerCase().includes(query);
            const matchCategory = !categoryFilter || exp.category === categoryFilter;

            let matchMonth = true;
            if (monthFilter) {
                const expMonth = exp.date.substring(0, 7);
                matchMonth = expMonth === monthFilter;
            }

            return matchQuery && matchCategory && matchMonth;
        });

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.renderTable(filtered);

        this.renderCategorySummary(filtered);
    },

    renderTable(filteredExpenses) {
        if (filteredExpenses.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 3rem 0;">
                        Nenhum lançamento encontrado com os filtros atuais.
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = filteredExpenses.map(exp => {
            const iconClass = App.getCategoryIcon(exp.category);
            return `
                <tr>
                    <td>${App.formatDate(exp.date)}</td>
                    <td style="font-weight: 600;">${exp.description}</td>
                    <td>
                        <span class="tag" style="background-color: var(--color-blue-light); color: var(--color-blue); font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
                            <i class="${iconClass}"></i> ${exp.category}
                        </span>
                    </td>
                    <td style="font-weight: 700; color: var(--color-red);">- ${App.formatCurrency(exp.value)}</td>
                    <td style="text-align: center;">
                        <div class="action-btns" style="justify-content: center;">
                            <button class="btn-icon btn-icon-edit" onclick="Historico.editExpenseTrigger('${exp.id}')" title="Editar Gasto">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-icon-delete" onclick="Historico.deleteExpenseTrigger('${exp.id}', '${exp.description.replace(/'/g, "\\'")}')" title="Excluir Gasto">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderCategorySummary(filteredExpenses) {
        const categories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros'];
        const categoryTotals = {};

        categories.forEach(cat => {
            categoryTotals[cat] = 0;
        });

        filteredExpenses.forEach(exp => {
            if (categoryTotals[exp.category] !== undefined) {
                categoryTotals[exp.category] += exp.value;
            } else {
                categoryTotals[exp.category] = exp.value;
            }
        });

        this.categoryTotalsSummary.innerHTML = categories.map(cat => {
            const total = categoryTotals[cat];
            const iconClass = App.getCategoryIcon(cat);
            return `
                <div class="category-badge-card">
                    <span class="category-name"><i class="${iconClass}"></i> ${cat}</span>
                    <span class="category-total">${App.formatCurrency(total)}</span>
                </div>
            `;
        }).join('');
    },

    editExpenseTrigger(id) {
        const expenses = StorageManager.getExpenses();
        const expense = expenses.find(exp => exp.id === id);
        if (expense) {
            this.openExpenseModal(expense);
        }
    },

    deleteExpenseTrigger(id, description) {
        this.openConfirmModal(id, description);
    }
};

window.Historico = Historico;
