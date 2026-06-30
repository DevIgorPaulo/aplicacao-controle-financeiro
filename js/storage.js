const STORAGE_KEY_EXPENSES = 'controle_financeiro_gastos';
const STORAGE_KEY_BALANCE = 'controle_financeiro_saldo_inicial';
const DEFAULT_INITIAL_BALANCE = 0;

const StorageManager = {
    getExpenses() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_EXPENSES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erro ao ler gastos do LocalStorage', e);
            return [];
        }
    },

    saveExpenses(expenses) {
        try {
            localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
            return true;
        } catch (e) {
            console.error('Erro ao salvar gastos no LocalStorage', e);
            return false;
        }
    },

    addExpense(expense) {
        const expenses = this.getExpenses();
        if (!expense.id) {
            expense.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }
        expenses.push(expense);
        this.saveExpenses(expenses);
        return expense;
    },

    updateExpense(updatedExpense) {
        let expenses = this.getExpenses();
        expenses = expenses.map(item => item.id === updatedExpense.id ? updatedExpense : item);
        this.saveExpenses(expenses);
        return updatedExpense;
    },

    deleteExpense(id) {
        let expenses = this.getExpenses();
        const initialLength = expenses.length;
        expenses = expenses.filter(item => item.id !== id);
        this.saveExpenses(expenses);
        return expenses.length !== initialLength;
    },

    getInitialBalance() {
        const balance = localStorage.getItem(STORAGE_KEY_BALANCE);
        if (balance === null) {
            this.setInitialBalance(DEFAULT_INITIAL_BALANCE);
            return DEFAULT_INITIAL_BALANCE;
        }
        return parseFloat(balance) || 0;
    },

    setInitialBalance(value) {
        localStorage.setItem(STORAGE_KEY_BALANCE, value.toString());
    }
};

window.StorageManager = StorageManager;
