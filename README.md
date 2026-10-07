# Fulltech Equipamentos — Catálogos

Aplicação web da Fulltech Equipamentos com gerenciamento completo de catálogos por categoria.

---

## Como instalar

### Pré-requisitos
- Node.js 18 ou superior
- npm

### Instalar dependências

**Terminal 1 — Backend:**
```bash
cd backend
npm install
```

**Terminal 2 — Frontend:**
```bash
npm install
```

---

## Como executar

São dois processos separados que precisam rodar simultaneamente.

**Terminal 1 — Backend (porta 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (porta 5173):**
```bash
npm run dev
```

Acesse o site em: **http://localhost:5173**

---

## Como acessar a área administrativa

1. Abra **http://localhost:5173/#/admin** no navegador
2. Use a senha definida em `backend/.env` → variável `ADMIN_PASSWORD`
   - Senha padrão já configurada: `fulltech@2026`
3. No painel você pode:
   - Criar, editar e excluir **categorias**
   - Dentro de cada categoria, criar, editar e excluir **catálogos**
   - Enviar PDFs (até 20 MB) ou informar links externos
   - Usar a busca em tempo real para filtrar categorias e catálogos

---

## Configuração do backend (.env)

O arquivo `backend/.env` já está configurado com valores padrão.  
Para produção, edite as variáveis conforme necessário:

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
ADMIN_PASSWORD=fulltech@2026   # Troque por uma senha forte
MAX_PDF_MB=20
```

---

## Persistência dos dados

- Categorias e catálogos: `backend/data/catalogos.json`
- PDFs enviados: `backend/uploads/`
- **Faça backup destas duas pastas** para não perder os dados.

---

## Estrutura de processos

| Processo  | Diretório  | Comando       | Porta |
|-----------|------------|---------------|-------|
| Backend   | `./backend` | `npm run dev` | 5000  |
| Frontend  | `./`        | `npm run dev` | 5173  |
