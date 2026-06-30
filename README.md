# UniWallet - Controle de Gastos Financeiros Pessoais

O **UniWallet** é um MVP (Minimum Viable Product) de controle de gastos pessoais responsivo, moderno e minimalista. Desenvolvido exclusivamente utilizando tecnologias nativas da web para facilitar a portabilidade e a evolução futura.

---

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica dos elementos da interface.
- **CSS3 (Vanilla)**: Design system customizado utilizando variáveis CSS, animações e layout flexível.
- **JavaScript (Vanilla)**: Lógica de controle, validação de formulários e gerenciamento de estados sem frameworks adicionais.
- **Chart.js (via CDN)**: Renderização dinâmica dos gráficos de pizza/barras.
- **LocalStorage**: Persistência 100% privada de dados diretamente no navegador do usuário.

---

## 📁 Estrutura de Pastas

```
├── index.html         - Dashboard principal (página inicial)
├── historico.html     - Lista detalhada de transações com busca e filtros
├── css/
│   └── style.css      - Definição do design system, reset e layout responsivo
└── js/
    ├── app.js         - Lógica comum e funções utilitárias do aplicativo
    ├── storage.js     - Gerenciador de leitura/escrita no LocalStorage
    ├── dashboard.js   - Controlador do painel, cards e renderização do gráfico
    └── historico.js   - Controlador da tabela, filtros e modais
```

---

## 🛠️ Principais Funcionalidades

1. **Dashboard do Usuário**:
   - Resumos visuais de **Saldo Disponível**, **Total Gasto**, **Quantidade de Gastos** e **Maior Categoria de Gasto**.
   - Gráfico dinâmico personalizável (Pizza/Rosca ou Barras por categoria) alimentado em tempo real.
   - Listagem rápida dos 5 últimos lançamentos ordenados por data.
   - Modais responsivos para Ajuste de Saldo Inicial e Cadastro Rápido.

2. **Histórico e Consulta**:
   - Tabela organizada por data com opção de busca textual na descrição.
   - Filtragem dinâmica por **Categoria** e por **Período (Mês/Ano)**.
   - Painel dinâmico exibindo os totais acumulados de cada categoria conforme os filtros de período aplicados.
   - Opções de Edição e Exclusão imediata (com modal de confirmação).

3. **Validação e UX**:
   - Transições de menu e modais fluidas.
   - Notificações rápidas (Toasts) informando ações bem-sucedidas ou mensagens de erro.
   - Validação de formulários no lado do cliente.

---

## 💻 Como Executar o Projeto

1. Faça o clone ou download deste repositório para o seu computador.
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
3. **Não há necessidade de servidor local, bancos de dados ou instalações de dependências como Node.js.**
