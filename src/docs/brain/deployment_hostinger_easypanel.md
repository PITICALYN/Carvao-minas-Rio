# Guia de Deploy: Hostinger + Easypanel + Cloudflare

Este guia explica como colocar seu projeto no ar usando seu servidor Hostinger com Easypanel e gerenciando o domínio pelo Cloudflare.

## 1. Configuração no Cloudflare (DNS)

Antes de mexer no Easypanel, aponte seu domínio para o servidor.

1.  Acesse o painel do **Cloudflare**.
2.  Selecione o seu domínio.
3.  Vá em **DNS** > **Records**.
4.  Adicione um novo registro:
    *   **Type**: `A`
    *   **Name**: `@` (ou um subdomínio, ex: `app` se for `app.seudominio.com`)
    *   **Content**: O **IP Público** do seu servidor Hostinger (você encontra isso no painel da Hostinger ou no topo do Easypanel).
    *   **Proxy status**: Deixe **Proxied (Nuvem Laranja)** ativado para proteção, ou **DNS Only (Nuvem Cinza)** se quiser que o Easypanel gerencie o SSL totalmente sozinho (recomendado deixar Laranja, mas requer ajuste no passo 3).
5.  Clique em **Save**.

## 2. Configuração no Easypanel

1.  Acesse seu painel **Easypanel**.
2.  Crie um novo **Project** (ex: `CarvaoApp`).
3.  Clique em **+ Service** e escolha **App**.
4.  **Source (Origem)**:
    *   Escolha **Git**.
    *   **Repository URL**: `https://github.com/PITICALYN/Carvao-minas-Rio.git`
    *   **Branch**: `main`
    *   (Se o repositório for privado, você precisará configurar um Token, mas como acabamos de fazer o push com token, ele deve estar acessível ou você pode usar o token `ghp_...` que você me passou).
5.  **Build**:
    *   **Type**: Selecione **Dockerfile** (Já criamos o arquivo Dockerfile na raiz do projeto).
    *   **Docker Context**: `/` (padrão).
6.  **Domains (Domínios)**:
    *   Adicione o domínio que você configurou no Cloudflare (ex: `seudominio.com` ou `app.seudominio.com`).
    *   O Easypanel tentará gerar um certificado SSL automaticamente.
7.  Clique em **Create** ou **Save & Deploy**.

## 3. Ajuste de SSL (Importante com Cloudflare)

Se você deixou a "Nuvem Laranja" ativada no Cloudflare, você precisa garantir que a criptografia esteja compatível para evitar o erro "Too many redirects".

1.  No **Cloudflare**, vá em **SSL/TLS**.
2.  Mude o modo para **Full** ou **Full (Strict)**.
    *   **Não use** "Flexible", pois isso causa loop de redirecionamento com o Easypanel.

## 4. Verificação

1.  No Easypanel, clique na aba **Deployments** e acompanhe o log.
2.  O processo vai: Clonar o GitHub -> Ler o Dockerfile -> Instalar dependências (npm install) -> Construir o React (npm run build) -> Iniciar o Nginx.
3.  Quando aparecer "Running" (Verde), acesse seu domínio no navegador.

---

**Resumo Técnico do Projeto:**
*   **Porta do Container**: O Nginx expõe a porta `80`. O Easypanel detecta isso automaticamente.
*   **Rotas**: O arquivo `nginx.conf` já está configurado para lidar com o React Router (SPA), redirecionando tudo para `index.html`.
