# 📝 My Tasks - Gerenciador de Tarefas Fullstack

Um sistema completo de gerenciamento de tarefas (To-Do List) desenvolvido para colocar em prática os conceitos fundamentais do desenvolvimento web Fullstack. A aplicação realiza todas as operações de um **CRUD** (Create, Read, Update, Delete) com persistência de dados.

---

## 🚀 Tecnologias Utilizadas

### Backend
* **Node.js**: Ambiente de execução JavaScript no servidor.
* **Express.js**: Framework minimalista para criação de rotas e APIs RESTful.
* **SQLite3**: Banco de dados relacional local, leve e nativo (armazenado em arquivo).
* **CORS**: Middleware para permitir a comunicação segura entre o frontend e o backend.

### Frontend
* **HTML5**: Estrutura semântica da página.
* **Bootstrap 5**: Framework CSS utilizado para criar um layout moderno, limpo e totalmente responsivo.
* **Bootstrap Icons**: Biblioteca de ícones estilizados para os botões.
* **JavaScript (Vanilla)**: Utilização da API nativa `fetch` com `async/await` para consumo assíncrono da API.

---

## 📦 Estrutura do Projeto

O projeto é dividido de forma clara entre a camada de cliente (frontend) e servidor (backend):

```text
My-Tasks/
├── backend/
│   ├── tarefas.db       # Arquivo automático do Banco de Dados SQLite
│   ├── server.js        # Código principal do servidor Express
│   ├── package.json     # Dependências do Node.js
│   └── node_modules/    # Pastas de pacotes instalados
└── frontend/
    └── index.html       # Interface visual e lógica de consumo da API 
```

### Rotas 
  - /api/tarefas : (GET) Lista as tarefas registradas
  - /api/tarefas : (POST) Registra uma nova tarefa
  - /api/tarefas/ :id : (PUT) Atualiza o status de uma tarefa (Concluida)
  - /api/tarefas/:id : (DELETE) Remove uma tarefa específica


## Como Executar o Projeto Localmente

Pré-requisitos

Node.JS instalado 

1- Clonar Repositório <br>
2- Configurar e inicar Backend <br>
2.1 - cd backend <br>
2.2 - npm install & node server.js <br>
3 - Abrir o arquivo index.html

