# Gerenciador de Pulso — Espuladeira v6.0

<p align="center">
  <strong>Sistema de cálculo preciso de pulsos para espuladeiras têxteis industriais</strong><br>
  <em>Stickfran Indústria e Comércio de Componentes</em>
</p>

---

## 📋 Sobre o Sistema

O **Gerenciador de Pulso** é uma aplicação web progressiva (PWA) desenvolvida para otimizar o processo de configuração de espuladeiras na indústria têxtil. O sistema permite:

- ⚙️ **Consulta & Setup** — Cálculo preciso de pulsos por camada e bobinas
- 📋 **Fichas Técnicas** — Gerenciamento de especificações de produção
- 👥 **Usuários** — Controle de acesso por perfil (Admin, PCP, Operador)
- 📐 **Análise Técnica** — Comparativo entre configurações
- 🗂 **Cadastros Base** — Tipos de fio e modelos de espula

---

## 🚀 Novidades da v6.0

### ✅ Correções
- **Bug crítico resolvido**: Exclusão e inativação de cadastros base agora funcionam corretamente
- Corrigida chamada assíncrona do modal de confirmação

### 📱 Mobile-First
- Layout totalmente responsivo com cards adaptáveis
- Área de toque otimizada (44px mínimo)
- Suporte a gestos (long-press)
- Safe area para iPhone X+

### ✨ Novos Recursos
- Botão de **Ativar/Desativar** para cadastros (preserva dados sem excluir)
- Feedbacks visuais aprimorados
- Confirmações contextuais personalizadas

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | HTML5, CSS3 (variáveis), JavaScript ES6+ |
| Backend | Supabase (PostgreSQL + REST API) |
| PWA | Service Worker, Web App Manifest |
| Fontes | Google Fonts (Barlow, Bebas Neue, Share Tech Mono) |

---

## 📦 Estrutura do Projeto

```
├── index.html          # Aplicação principal (SPA)
├── manifest.json       # Configuração PWA
├── service-worker.js   # Cache e offline
├── css/
│   └── style.css       # Estilos completos
├── js/
│   ├── app.js          # Módulo principal
│   ├── cadastros.js    # Cadastros Base (v6.0)
│   ├── db-base.js      # API Supabase - Cadastros
│   ├── ux.js           # Melhorias de UX
│   └── ...             # Outros módulos
├── img/
│   └── icons/          # Ícones PWA
├── sql/
│   └── SUPABASE_SETUP_v6.sql  # Schema do banco
└── docs/
    └── GUIA_DEPLOY.md  # Instruções de deploy
```

---

## 🔧 Instalação

### Pré-requisitos
- Conta no [Supabase](https://supabase.com)
- Servidor web (Apache, Nginx, ou estático)

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/Gerenciador-de-Pulsos-Quebra.git
   ```

2. **Configure o Supabase**
   - Crie um novo projeto
   - Execute o script `sql/SUPABASE_SETUP_v6.sql`
   - Copie as credenciais (URL e ANON_KEY)

3. **Configure as credenciais**
   - Edite `js/config.js` com suas credenciais Supabase

4. **Deploy**
   - Faça upload dos arquivos para seu servidor
   - Configure HTTPS (obrigatório para PWA)

---

## 📱 PWA — Instalação no Dispositivo

O sistema pode ser instalado como aplicativo:

1. Acesse o sistema pelo navegador
2. Clique em "Instalar" no header (ou use o menu do navegador)
3. O app ficará disponível na tela inicial

---

## 🔐 Perfis de Acesso

| Perfil | Permissões |
|--------|------------|
| **Admin** | Acesso total + Gerenciamento de usuários e cadastros |
| **PCP** | Fichas técnicas + Consulta |
| **Operador** | Apenas consulta de setup |

---

## 📄 Licença

Uso interno — Stickfran Indústria e Comércio de Componentes

---

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de TI.