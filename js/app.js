document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    init() {
        this.highlightActiveMenu();
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },

    showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = '<i class="fas fa-check-circle"></i>';
        if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle"></i>';
        } else if (type === 'info') {
            icon = '<i class="fas fa-info-circle"></i>';
        }

        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);

        // Remover do DOM após a animação
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    highlightActiveMenu() {
        const path = window.location.pathname;
        const page = path.split("/").pop();

        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        menuItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                if (page === href || (page === '' && href === 'index.html')) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    },

    getCategoryIcon(category) {
        const icons = {
            'Alimentação': 'fas fa-utensils',
            'Transporte': 'fas fa-car',
            'Moradia': 'fas fa-home',
            'Saúde': 'fas fa-heartbeat',
            'Lazer': 'fas fa-gamepad',
            'Educação': 'fas fa-graduation-cap',
            'Outros': 'fas fa-receipt'
        };
        return icons[category] || 'fas fa-money-bill-wave';
    }
};

window.App = App;
