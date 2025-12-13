# Deployment Guide - Easypanel

**Easypanel** is a modern control panel that uses Docker. The best way to deploy your app there is using a **Dockerfile**.

## Prerequisites
- I have created a `Dockerfile` in the project root.
- I have updated `nginx.conf` to work inside the Docker container.
- You need to have this project in a **Git repository** (GitHub, GitLab, or private).

## Steps to Deploy

### 1. Push to GitHub
Easypanel works best when connected to a Git repository.
1.  Create a new repository on GitHub.
2.  Push all the project files (including `Dockerfile` and `nginx.conf`) to this repository.

### 2. Configure Easypanel
1.  Log in to your Easypanel dashboard.
2.  Create a new **Project** (e.g., "Charcoal App").
3.  Click **+ Service** and select **App**.
4.  **Source**: Select "Git".
5.  **Repository**: Enter your GitHub repository URL (e.g., `https://github.com/seu-usuario/seu-repo`).
6.  **Build Type**: Select "Dockerfile".
7.  **Port**: The app exposes port `80`, so ensure Easypanel maps the external port (usually 80 or 443) to container port `80`.

### 3. Deploy
1.  Click **Create** or **Deploy**.
2.  Easypanel will:
    - Clone your code.
    - Read the `Dockerfile`.
    - Build the application (install npm dependencies, build the React app).
    - Start the Nginx server inside the container.

### 4. Verify
Wait for the build logs to finish. Once it says "Running", click the domain provided by Easypanel (or configure your custom domain) to access the system.

---

**Note**: If you cannot use GitHub, you can technically build the Docker image locally and push it to Docker Hub, but the Git method is much easier and automatic.

