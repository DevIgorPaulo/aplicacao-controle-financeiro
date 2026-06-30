
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

const Dashboard = {
    chartInstance: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.setDefaultDate();
        this.render();
    },

    cacheDOM() {
        this.cardBalance = document.getElementById('card-balance');
        this.cardTotalSpent = document.getElementById('card-total-spent');
        this.cardExpenseCount = document.getElementById('card-expense-count');
        this.cardTopCategory = document.getElementById('card-top-category');

        this.recentExpensesContainer = document.getElementById('recent-expenses-container');

        this.btnNewExpense = document.getElementById('btn-add-expense-trigger');
        this.btnEditBalance = document.getElementById('btn-edit-balance');

        this.modalExpenseOverlay = document.getElementById('modal-expense-overlay');
        this.modalExpenseClose = document.getElementById('modal-expense-close');
        this.btnCancelExpense = document.getElementById('btn-cancel-expense');
        this.formExpense = document.getElementById('form-expense');

        this.modalBalanceOverlay = document.getElementById('modal-balance-overlay');
        this.modalBalanceClose = document.getElementById('modal-balance-close');
        this.btnCancelBalance = document.getElementById('btn-cancel-balance');
        this.formBalance = document.getElementById('form-balance');
        this.chartTypeSelector = document.getElementById('chart-type-selector');
    },

    bindEvents() {
        this.btnNewExpense.addEventListener('click', () => this.openExpenseModal());
        this.modalExpenseClose.addEventListener('click', () => this.closeExpenseModal());
        this.btnCancelExpense.addEventListener('click', () => this.closeExpenseModal());
        this.formExpense.addEventListener('submit', (e) => this.handleExpenseSubmit(e));

        this.btnEditBalance.addEventListener('click', () => this.openBalanceModal());
        this.modalBalanceClose.addEventListener('click', () => this.closeBalanceModal());
        this.btnCancelBalance.addEventListener('click', () => this.closeBalanceModal());
        this.formBalance.addEventListener('submit', (e) => this.handleBalanceSubmit(e));

        this.chartTypeSelector.addEventListener('change', () => this.renderChart());
    },

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;
    },

    openExpenseModal() {
        this.formExpense.reset();
        document.getElementById('expense-id').value = '';
        this.setDefaultDate();
        document.getElementById('modal-title').textContent = 'Adicionar Novo Gasto';
        this.modalExpenseOverlay.classList.add('active');
    },

    closeExpenseModal() {
        this.modalExpenseOverlay.classList.remove('active');
    },

    openBalanceModal() {
        const currentBalance = StorageManager.getInitialBalance();
        document.getElementById('balance-value').value = currentBalance;
        this.modalBalanceOverlay.classList.add('active');
    },

    closeBalanceModal() {
        this.modalBalanceOverlay.classList.remove('active');
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

    handleBalanceSubmit(e) {
        e.preventDefault();
        const value = parseFloat(document.getElementById('balance-value').value);

        if (isNaN(value) || value < 0) {
            App.showToast('Insira um valor de saldo válido.', 'error');
            return;
        }

        StorageManager.setInitialBalance(value);
        App.showToast('Saldo inicial atualizado com sucesso!');
        this.closeBalanceModal();
        this.render();
    },

    render() {
        const expenses = StorageManager.getExpenses();
        const initialBalance = StorageManager.getInitialBalance();

        // Calcular Totais
        const totalSpent = expenses.reduce((acc, curr) => acc + curr.value, 0);
        const availableBalance = initialBalance - totalSpent;
        const count = expenses.length;

        // Renderizar Cards
        this.cardBalance.textContent = App.formatCurrency(availableBalance);
        // Mudar cor do card de saldo caso negativo
        if (availableBalance < 0) {
            this.cardBalance.style.color = 'var(--color-red)';
        } else {
            this.cardBalance.style.color = 'var(--color-green)';
        }

        this.cardTotalSpent.textContent = App.formatCurrency(totalSpent);
        this.cardExpenseCount.textContent = count;

        // Calcular Maior Categoria
        const categoryTotals = {};
        expenses.forEach(exp => {
            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.value;
        });

        let topCategory = 'Nenhuma';
        let maxSpent = 0;
        for (const cat in categoryTotals) {
            if (categoryTotals[cat] > maxSpent) {
                maxSpent = categoryTotals[cat];
                topCategory = cat;
            }
        }
        this.cardTopCategory.textContent = topCategory !== 'Nenhuma' ? `${topCategory} (${App.formatCurrency(maxSpent)})` : 'Nenhuma';

        this.renderRecentList(expenses);

        this.renderChart(categoryTotals);
    },

    renderRecentList(expenses) {
        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sorted.slice(0, 5);

        if (recent.length === 0) {
            this.recentExpensesContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">
                    Nenhum gasto cadastrado.
                </div>
            `;
            return;
        }

        this.recentExpensesContainer.innerHTML = recent.map(exp => {
            const iconClass = App.getCategoryIcon(exp.category);
            return `
                <div class="transaction-item ${exp.category}">
                    <div class="transaction-info">
                        <span class="transaction-name">${exp.description}</span>
                        <div class="transaction-meta">
                            <span class="tag"><i class="${iconClass}"></i> ${exp.category}</span>
                            <span><i class="far fa-calendar-alt"></i> ${App.formatDate(exp.date)}</span>
                        </div>
                    </div>
                    <span class="transaction-val">- ${App.formatCurrency(exp.value)}</span>
                </div>
            `;
        }).join('');
    },

    renderChart(categoryTotals) {
        if (!categoryTotals) {
            const expenses = StorageManager.getExpenses();
            categoryTotals = {};
            expenses.forEach(exp => {
                categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.value;
            });
        }

        const ctx = document.getElementById('expenses-chart').getContext('2d');
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        if (labels.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            return;
        }

        const textColor = '#64748b';
        const borderColor = '#e2e8f0';

        const colorsMap = {
            'Alimentação': '#f59e0b',
            'Transporte': '#3b82f6',
            'Moradia': '#8b5cf6',
            'Saúde': '#10b981',
            'Lazer': '#ec4899',
            'Educação': '#6366f1',
            'Outros': '#64748b'
        };

        const bgColors = labels.map(label => colorsMap[label] || '#3b82f6');
        const chartType = this.chartTypeSelector.value;

        this.chartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Gasto (R$)',
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 1,
                    borderColor: borderColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: chartType === 'doughnut' ? 'right' : 'top',
                        labels: {
                            color: textColor,
                            font: {
                                family: 'Outfit',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== undefined) {
                                    label += App.formatCurrency(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: chartType === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: borderColor
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: 'Outfit'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: 'Outfit'
                            }
                        }
                    }
                } : {}
            }
        });
    }
};

window.Dashboard = Dashboard;
