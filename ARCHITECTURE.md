# MR QR Code - Sistema de Senhas com QR Code

Sistema multi-tenant de gerenciamento de filas com QR Code para barbearias e estabelecimentos.

---

## Diagrama da Arquitetura

```
                          ┌─────────────────────────────────┐
                          │           CLIENTE                │
                          │  (Celular / Navegador)           │
                          │                                  │
                          │   1. Escaneia QR Code            │
                          │   2. Clica "Tirar Senha"         │
                          │   3. Recebe numero da senha      │
                          └──────────────┬──────────────────┘
                                         │
                                         │ HTTP :3000
                                         ▼
                ┌─────────────────────────────────────────────────┐
                │              NGINX (Proxy Reverso)              │
                │                  porta 3000                     │
                │                                                 │
                │   /              → React SPA (arquivos static)  │
                │   /password/*    → proxy → server-qrcode:8080   │
                │   /tenants/*     → proxy → server-qrcode:8080   │
                └──────────┬──────────────────┬──────────────────┘
                           │                  │
              Arquivos     │                  │  API calls
              estáticos    │                  │
                           ▼                  ▼
    ┌──────────────────────────┐   ┌──────────────────────────────┐
    │    FRONT-END (React)     │   │    BACK-END (Quarkus)        │
    │                          │   │        porta 8080             │
    │  ┌────────────────────┐  │   │                              │
    │  │ /:token             │  │   │  POST /password/take         │
    │  │ Pagina do cliente   │  │   │  → Gera nova senha           │
    │  │ (tirar senha)       │  │   │                              │
    │  ├────────────────────┤  │   │  POST /password/call-next     │
    │  │ /admin/:token       │  │   │  → Chama proxima senha       │
    │  │ Painel do dono      │  │   │                              │
    │  │ (chamar senhas)     │  │   │  GET  /password/queue         │
    │  ├────────────────────┤  │   │  → Status da fila             │
    │  │ /qrcode/:token      │  │   │                              │
    │  │ Exibe QR Code       │  │   │  GET  /password/qrcode        │
    │  └────────────────────┘  │   │  → Gera SVG do QR Code       │
    │                          │   │                              │
    │  React 18                │   │  POST /password/reset         │
    │  React Router 7          │   │  → Reseta fila do dia        │
    │                          │   │                              │
    └──────────────────────────┘   │  CRUD /tenants                │
                                   │  → Gerenciar estabelecimentos │
                                   │                              │
                                   │  Java 21 + Quarkus 3.17      │
                                   │  Hibernate ORM + Panache     │
                                   │  ZXing (QR Code)             │
                                   └──────────────┬───────────────┘
                                                  │
                                                  │ JDBC :5432
                                                  ▼
                                   ┌──────────────────────────────┐
                                   │     POSTGRESQL 16             │
                                   │       porta 5432              │
                                   │                              │
                                   │  ┌────────────────────────┐  │
                                   │  │ tenants                 │  │
                                   │  │ ─────────────────────── │  │
                                   │  │ id, token, business_name│  │
                                   │  │ instagram_url           │  │
                                   │  │ google_review_url       │  │
                                   │  │ logo_url, background_url│  │
                                   │  │ current_password        │  │
                                   │  │ current_serving         │  │
                                   │  │ session_timeout_minutes │  │
                                   │  │ active                  │  │
                                   │  └────────────────────────┘  │
                                   │                              │
                                   │  ┌────────────────────────┐  │
                                   │  │ passwords               │  │
                                   │  │ ─────────────────────── │  │
                                   │  │ id, password_number     │  │
                                   │  │ tenant_id (FK)          │  │
                                   │  │ status (WAITING/CALLED/ │  │
                                   │  │   COMPLETED/CANCELLED)  │  │
                                   │  │ created_at, called_at   │  │
                                   │  │ completed_at            │  │
                                   │  └────────────────────────┘  │
                                   │                              │
                                   │  Volume: postgres_data       │
                                   └──────────────────────────────┘
```

---

## Fluxo do Cliente

```
  QR Code na mesa            Celular do cliente         Back-end
  ──────────────             ──────────────────         ────────
       │                            │                       │
       │   1. Escaneia              │                       │
       │ ─────────────────────────> │                       │
       │                            │                       │
       │                            │  2. POST /password/take
       │                            │ ────────────────────> │
       │                            │                       │
       │                            │  3. { password: 42 }  │
       │                            │ <──────────────────── │
       │                            │                       │
       │                   4. Mostra "Sua senha: 42"        │
       │                      + timer de espera             │
       │                            │                       │
```

## Fluxo do Estabelecimento

```
  Painel Admin               Back-end                  Banco
  ────────────               ────────                  ─────
       │                        │                        │
       │  1. POST /call-next    │                        │
       │ ─────────────────────> │  2. SELECT waiting     │
       │                        │ ─────────────────────> │
       │                        │  3. senha #42           │
       │                        │ <───────────────────── │
       │  4. { password: 42 }   │                        │
       │ <───────────────────── │  5. UPDATE status      │
       │                        │ ─────────────────────> │
       │                        │                        │
  6. Mostra "Chamando: 42"     │                        │
       │                        │                        │
```

---

## Como Rodar

### Com Docker (recomendado)
```bash
docker compose up --build
# Front-end → http://localhost:3000
# API       → http://localhost:8080
```

### Desenvolvimento local
```bash
# Terminal 1 - Back-end
cd server-qrcode
mvn quarkus:dev

# Terminal 2 - Front-end
REACT_APP_API_URL=http://localhost:8080/password npm start
```

### Testar endpoints
```bash
# Tirar senha
curl -X POST "http://localhost:8080/password/take?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"

# Ver fila
curl "http://localhost:8080/password/queue?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"

# Chamar proxima
curl -X POST "http://localhost:8080/password/call-next?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"

# QR Code (SVG)
curl "http://localhost:8080/password/qrcode?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"
```

---

## Estrutura do Projeto

```
client-qrcode/
├── docker-compose.yml          # Orquestra tudo
├── Dockerfile                  # Build do front-end
├── nginx.conf                  # Proxy reverso
├── src/                        # React (front-end)
│   ├── pages/
│   │   ├── Client/             # Pagina do cliente (tirar senha)
│   │   ├── Admin/              # Painel do estabelecimento
│   │   └── QRCode/             # Exibicao do QR Code
│   └── utils/
│       └── fetchPassword.js    # Chamadas HTTP para a API
│
└── server-qrcode/              # Quarkus (back-end)
    ├── Dockerfile              # Build do back-end
    ├── pom.xml
    └── src/main/java/com/mrqrcode/
        ├── entity/             # Tenant, Password
        ├── dto/                # Records (PasswordResponse, etc)
        ├── service/            # Logica de negocio
        └── resource/           # REST endpoints
```

## Multi-tenancy

Cada estabelecimento tem um **token unico**. O token aparece na URL:
- Cliente: `https://mrqrcode.site/{token}`
- Admin: `https://mrqrcode.site/admin/{token}`
- QR Code: `https://mrqrcode.site/qrcode/{token}`

Para criar um novo estabelecimento:
```bash
curl -X POST http://localhost:8080/tenants \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Minha Barbearia", "sessionTimeoutMinutes": 30}'
```
