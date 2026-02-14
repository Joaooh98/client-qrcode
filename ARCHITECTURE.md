# MR QR Code - Sistema de Senhas com QR Code

Sistema multi-tenant de gerenciamento de filas com QR Code para barbearias, restaurantes e qualquer estabelecimento.

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
                          ┌──────────────┴──────────────────┐
                          │       DONO / OPERADOR            │
                          │  (Computador / Tablet)           │
                          │                                  │
                          │   1. Faz login (/login)          │
                          │   2. Acessa painel admin          │
                          │   3. Chama proxima senha         │
                          │   4. Configura estabelecimento   │
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
                │   /auth/*        → proxy → server-qrcode:8080   │
                └──────────┬──────────────────┬──────────────────┘
                           │                  │
              Arquivos     │                  │  API calls
              estáticos    │                  │
                           ▼                  ▼
    ┌──────────────────────────┐   ┌──────────────────────────────┐
    │    FRONT-END (React)     │   │    BACK-END (Quarkus)        │
    │                          │   │        porta 8080             │
    │  ┌────────────────────┐  │   │                              │
    │  │ /:token             │  │   │  ── Autenticação ──          │
    │  │ Pagina do cliente   │  │   │  POST /auth/register         │
    │  │ (tirar senha)       │  │   │  → Cadastra usuario + tenant │
    │  ├────────────────────┤  │   │                              │
    │  │ /:token/wait-for-   │  │   │  POST /auth/login            │
    │  │ turn                │  │   │  → Retorna JWT (24h)         │
    │  │ Aguardando a vez    │  │   │                              │
    │  ├────────────────────┤  │   │  GET  /auth/me                │
    │  │ /login              │  │   │  → Valida token              │
    │  │ Tela de login       │  │   │                              │
    │  ├────────────────────┤  │   │  ── Senhas / Fila ──          │
    │  │ /register           │  │   │  POST /password/take         │
    │  │ Cadastro usuario    │  │   │  → Gera nova senha           │
    │  │ + estabelecimento   │  │   │                              │
    │  ├────────────────────┤  │   │  POST /password/call-next     │
    │  │ /admin/:token       │  │   │  → Chama proxima senha       │
    │  │ Painel admin        │  │   │                              │
    │  │ ├ Aba Fila          │  │   │  GET  /password/queue         │
    │  │ ├ Aba QR Code       │  │   │  → Status da fila             │
    │  │ └ Aba Config        │  │   │                              │
    │  └────────────────────┘  │   │  POST /password/reset         │
    │                          │   │  → Reseta fila do dia         │
    │  React 18                │   │                              │
    │  React Router 7          │   │  GET  /password/qrcode        │
    │                          │   │  → Gera SVG do QR Code       │
    └──────────────────────────┘   │                              │
                                   │  ── Estabelecimentos ──       │
                                   │  CRUD /tenants                │
                                   │  → Gerenciar estabelecimentos │
                                   │                              │
                                   │  Java 21 + Quarkus 3.17      │
                                   │  Hibernate ORM + Panache     │
                                   │  ZXing (QR Code)             │
                                   │  JWT (HMAC-SHA256)            │
                                   └──────────────┬───────────────┘
                                                  │
                                                  │ JDBC :5432
                                                  ▼
                                   ┌──────────────────────────────┐
                                   │     POSTGRESQL 16             │
                                   │       porta 5432              │
                                   │                              │
                                   │  ┌────────────────────────┐  │
                                   │  │ users                   │  │
                                   │  │ ─────────────────────── │  │
                                   │  │ id, email, password_hash│  │
                                   │  │ name, role (ADMIN/      │  │
                                   │  │   OPERATOR)             │  │
                                   │  │ tenant_id (FK), active  │  │
                                   │  └────────────────────────┘  │
                                   │             │ N:1             │
                                   │             ▼                 │
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
                                   │             │ 1:N             │
                                   │             ▼                 │
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
       │                      + links redes sociais         │
       │                            │                       │
```

## Fluxo de Cadastro + Login

```
  Dono do negocio            Front-end                 Back-end
  ───────────────            ─────────                 ────────
       │                        │                         │
       │  1. Acessa /register   │                         │
       │ ─────────────────────> │                         │
       │                        │                         │
       │  2. Preenche dados     │                         │
       │  (nome, email, senha,  │                         │
       │   nome do negocio)     │                         │
       │ ─────────────────────> │  3. POST /auth/register │
       │                        │ ──────────────────────> │
       │                        │                         │ 4. Cria Tenant
       │                        │                         │    Cria User
       │                        │  5. { jwt, tenantToken } │    Gera JWT
       │                        │ <────────────────────── │
       │                        │                         │
       │  6. Redireciona para   │                         │
       │     /admin/:token      │                         │
       │ <───────────────────── │                         │
       │                        │                         │
```

## Fluxo do Estabelecimento (Chamar Senhas)

```
  Painel Admin               Back-end                  Banco
  ────────────               ────────                  ─────
       │                        │                        │
       │  1. POST /call-next    │                        │
       │     + JWT no header    │                        │
       │ ─────────────────────> │  2. SELECT waiting     │
       │                        │ ─────────────────────> │
       │                        │  3. senha #42           │
       │                        │ <───────────────────── │
       │  4. { password: 42 }   │                        │
       │ <───────────────────── │  5. UPDATE status      │
       │                        │     = CALLED            │
       │                        │ ─────────────────────> │
       │                        │                        │
  6. Mostra "Chamando: 42"     │                        │
     com animacao pulsante     │                        │
       │                        │                        │
```

---

## Telas do Sistema

### Cliente (sem login)
| Rota | Tela | Descricao |
|---|---|---|
| `/:token` | Tirar Senha | Botao para gerar senha, suporte PT/EN |
| `/:token/wait-for-turn` | Aguardar | Mostra senha + timer + redes sociais do tenant |

### Administrativo (com login)
| Rota | Tela | Descricao |
|---|---|---|
| `/login` | Login | Email + senha, retorna JWT |
| `/register` | Cadastro | Cria usuario + estabelecimento |
| `/admin/:token` | Dashboard | Painel com 3 abas |

### Painel Admin - Abas
| Aba | Funcionalidades |
|---|---|
| **Fila** | Senha atual atendendo, quantidade na fila, botao "Chamar Proxima", botao "Resetar Fila", lista de senhas aguardando (auto-refresh 5s) |
| **QR Code** | Preview do QR Code SVG, URL do estabelecimento para imprimir |
| **Config** | Editar: nome do negocio, Instagram URL, Google Reviews URL, tempo de sessao |

---

## API Endpoints

### Autenticacao
| Metodo | Endpoint | Descricao | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Cadastra usuario + cria tenant | Nao |
| `POST` | `/auth/login` | Login, retorna JWT (24h) | Nao |
| `GET` | `/auth/me` | Valida token, retorna dados | JWT |

### Senhas / Fila
| Metodo | Endpoint | Descricao | Auth |
|---|---|---|---|
| `POST` | `/password/take?token=` | Gerar nova senha | Nao |
| `POST` | `/password/call-next?token=` | Chamar proxima senha | JWT |
| `GET` | `/password/queue?token=` | Status da fila | Nao |
| `POST` | `/password/reset?token=` | Resetar fila do dia | JWT |
| `GET` | `/password/qrcode?token=` | QR Code SVG | Nao |

### Estabelecimentos
| Metodo | Endpoint | Descricao | Auth |
|---|---|---|---|
| `GET` | `/tenants` | Listar todos | Nao |
| `GET` | `/tenants/{token}` | Buscar por token | Nao |
| `POST` | `/tenants` | Criar | Nao |
| `PUT` | `/tenants/{token}` | Atualizar | JWT |
| `DELETE` | `/tenants/{token}` | Desativar | JWT |

---

## Como Rodar

### Com Docker (recomendado)
```bash
docker compose up --build

# Front-end → http://localhost:3000
# API       → http://localhost:8080
# DB        → localhost:5432 (user: mrqrcode, pass: mrqrcode)
```

### Desenvolvimento local
```bash
# Terminal 1 - Back-end
cd server-qrcode
mvn quarkus:dev

# Terminal 2 - Front-end
REACT_APP_API_URL=http://localhost:8080/password npm start
```

### Usuario padrao (dev/test)
```
Email: admin@mrqrcode.com
Senha: admin123
```

### Testar endpoints
```bash
# Cadastrar novo usuario + estabelecimento
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Joao","email":"joao@test.com","password":"123456","businessName":"Minha Barbearia"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mrqrcode.com","password":"admin123"}'

# Tirar senha (cliente)
curl -X POST "http://localhost:8080/password/take?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"

# Ver fila
curl "http://localhost:8080/password/queue?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"

# Chamar proxima (com JWT)
curl -X POST "http://localhost:8080/password/call-next?token=e8aaf53b-a549-423c-8349-f189f03d0b5c" \
  -H "Authorization: Bearer SEU_JWT_AQUI"

# QR Code (SVG)
curl "http://localhost:8080/password/qrcode?token=e8aaf53b-a549-423c-8349-f189f03d0b5c"
```

---

## Estrutura do Projeto

```
client-qrcode/
├── docker-compose.yml              # Orquestra PostgreSQL + API + Front
├── Dockerfile                      # Build do front-end (Node + Nginx)
├── nginx.conf                      # Proxy reverso para API
├── ARCHITECTURE.md                 # Este arquivo
│
├── src/                            # React (front-end)
│   ├── App.js                      # Router principal
│   ├── components/
│   │   ├── loginScreen/            # Tela de login
│   │   ├── registerScreen/         # Tela de cadastro
│   │   ├── adminDashboard/         # Painel admin (Fila/QR/Config)
│   │   ├── retrivePasswordScreen/  # Tela do cliente (tirar senha)
│   │   ├── waitForTurnScreen/      # Tela de espera (dinamica por tenant)
│   │   ├── backButton/             # Componente botao voltar
│   │   └── icons/                  # Icones SVG (Google, Instagram)
│   └── utils/
│       └── fetchPassword.js        # Todas as chamadas HTTP para a API
│
└── server-qrcode/                  # Quarkus (back-end)
    ├── Dockerfile                  # Build (Maven + JRE)
    ├── pom.xml
    └── src/main/java/com/mrqrcode/
        ├── entity/                 # User, Tenant, Password
        ├── dto/                    # Records (Auth, Password, Tenant, Queue)
        ├── service/                # AuthService, PasswordService,
        │                           # QrCodeService, TenantService
        └── resource/               # AuthResource, PasswordResource,
                                    # TenantResource, ErrorMapper
```

---

## Multi-tenancy

Cada estabelecimento tem um **token unico** gerado automaticamente (UUID).

| Quem | URL | Exemplo |
|---|---|---|
| Cliente | `/{token}` | `/e8aaf53b-a549-423c-8349-f189f03d0b5c` |
| Admin | `/admin/{token}` | `/admin/e8aaf53b-a549-423c-8349-f189f03d0b5c` |
| Login | `/login` | Unico para todos |
| Cadastro | `/register` | Cria tenant + user |

### Criar novo estabelecimento via API
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@restaurante.com",
    "password": "minhasenha",
    "businessName": "Restaurante da Maria",
    "instagramUrl": "https://instagram.com/restmaria",
    "googleReviewUrl": "https://google.com/...",
    "sessionTimeoutMinutes": 60
  }'
```

### Criar via interface
Acesse `/register` e preencha o formulario.
