# Armazém · Painel de gestão

Frontend React + TypeScript para a API de loja documentada em `API.md`.

## Desenvolvimento

```bash
npm install
npm run dev
```

O Vite inicia em `http://localhost:5173`. Em desenvolvimento, as chamadas `/api/*` são encaminhadas para `https://backend-unze.onrender.com` pelo proxy local, evitando CORS no navegador. A URL também pode ser alterada na tela de login ou em **Configuração da API**.

## Produção

```bash
npm run build
npm run preview
```

Configure `VITE_API_URL` com a URL base da API no ambiente de build, se ela for diferente de `https://backend-unze.onrender.com`. A origem pública do frontend também precisa estar incluída em `FRONTEND_ORIGIN` no backend.

## Acesso

O login usa `POST /login` e uma conta ativa da tabela `usuarios`. Não existe cadastro público na API: a primeira conta precisa ser criada pelo processo administrativo documentado em `API.md`. Após o login, o frontend usa o JWT nas rotas protegidas.
