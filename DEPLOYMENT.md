# Strapi CMS Deployment Guide

This guide explains how to deploy your Strapi CMS application to a VPS using Docker and GitHub Actions.

## 📋 Prerequisites

- A VPS with Docker and Docker Compose installed
- GitHub account with repository access
- Domain name (optional, but recommended)

## 🚀 Quick Start

### 1. VPS Setup

SSH into your VPS and run the following commands:

```bash
# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Create project directory
mkdir -p ~/my-lqdam-cms
cd ~/my-lqdam-cms

# Create .env file
nano .env
```

### 2. Environment Variables (.env on VPS)

Create a `.env` file on your VPS with the following content:

```env
# Server Configuration
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Security Keys (Generate new ones for production!)
APP_KEYS=your-app-key-1,your-app-key-2,your-app-key-3,your-app-key-4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
ENCRYPTION_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret

# Database Configuration (SQLite)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# External Services
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=https://your-frontend-domain.com

# Optional: PostgreSQL Configuration
# Uncomment and configure if using PostgreSQL instead of SQLite
# DATABASE_CLIENT=postgres
# DATABASE_HOST=postgres
# DATABASE_PORT=5432
# DATABASE_NAME=strapi
# DATABASE_USERNAME=strapi
# DATABASE_PASSWORD=your-secure-password
# DATABASE_SSL=false
```

**Important:** Generate secure random values for all secret keys. You can use:
```bash
openssl rand -base64 32
```

### 3. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### Required Secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VPS_HOST` | Your VPS IP address or domain | `123.456.789.0` |
| `VPS_USERNAME` | SSH username | `root` or `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key for authentication | Your private key content |
| `GH_PAT` | GitHub Personal Access Token with `read:packages` scope | `ghp_xxxxxxxxxxxxx` |

#### Optional Secrets (for Telegram notifications):

| Secret Name | Description |
|------------|-------------|
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `TELEGRAM_TOKEN` | Your Telegram bot token |
| `VPS_URL` | Your application URL (for notifications) |
| `VPS_PORT` | SSH port (default: 22) |

### 4. Generate SSH Key (if needed)

On your VPS:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions"

# Add public key to authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# Display private key (copy this to GitHub secrets as VPS_SSH_KEY)
cat ~/.ssh/id_ed25519
```

### 5. Generate GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Docker Registry Access")
4. Select scope: `read:packages`
5. Generate and copy the token
6. Add it to your repository secrets as `GH_PAT`

### 6. Copy docker-compose.yml to VPS

Copy the `docker-compose.yml` file to your VPS:

```bash
# On your VPS
cd ~/my-lqdam-cms
nano docker-compose.yml
```

Paste the content from the repository's `docker-compose.yml` file.

## 🔄 Deployment Process

### Automatic Deployment

Every push to the `master` branch will trigger the deployment workflow:

1. **Build Stage:**
   - Checks out code
   - Sets up Docker Buildx
   - Logs into GitHub Container Registry
   - Builds Docker image with caching
   - Pushes image to GitHub Container Registry

2. **Deploy Stage:**
   - SSHs into VPS
   - Pulls latest Docker image
   - Stops old container
   - Starts new container
   - Verifies deployment
   - Cleans up old images

3. **Notification:**
   - Sends Telegram notification (if configured)

### Manual Deployment

You can also trigger deployment manually:

1. Go to Actions tab in your GitHub repository
2. Select "Deploy Strapi CMS to VPS" workflow
3. Click "Run workflow"

## 📦 Docker Commands

Useful Docker commands for managing your deployment:

```bash
# View running containers
docker ps

# View logs
docker compose logs -f strapi

# Restart container
docker compose restart strapi

# Stop container
docker compose down

# Update to latest image
docker compose pull
docker compose up -d

# Clean up unused images
docker image prune -f

# Access container shell
docker exec -it my-lqdam-cms sh
```

## 🔧 Nginx Configuration (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then setup SSL with Let's Encrypt:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔍 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs strapi

# Check if port is already in use
sudo netstat -tulpn | grep 1337

# Restart Docker
sudo systemctl restart docker
```

### Database issues

```bash
# Backup database
docker compose exec strapi cp .tmp/data.db .tmp/data.db.backup

# Check database file permissions
docker compose exec strapi ls -la .tmp/
```

### Build failures

- Check if all environment variables are set correctly
- Verify GitHub secrets are properly configured
- Check GitHub Actions logs for detailed error messages

## 📊 Health Checks

The application includes health checks:

```bash
# Manual health check
curl http://your-domain.com/_health

# Or on the VPS
curl http://localhost:1337/_health
```

A `204 No Content` response indicates the application is healthy.

## 🔐 Security Recommendations

1. **Use strong, unique secrets** - Generate new secrets for production
2. **Enable firewall** - Only allow necessary ports (22, 80, 443)
3. **Regular updates** - Keep Docker and system packages updated
4. **Backup database** - Regularly backup `.tmp/data.db` file
5. **Monitor logs** - Set up log monitoring and alerts
6. **Use HTTPS** - Always use SSL in production
7. **Limit SSH access** - Use key-based authentication only

## 📝 Backup Strategy

### Automated Backup Script

Create a backup script on your VPS:

```bash
#!/bin/bash
# Save as ~/backup.sh

BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T strapi cat .tmp/data.db > $BACKUP_DIR/data_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz public/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "data_*.db" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
crontab -e
# Add this line to run daily at 2 AM:
0 2 * * * cd ~/my-lqdam-cms && ./backup.sh
```

## 🎯 Next Steps

- Configure your Strapi admin panel
- Set up content types and permissions
- Configure plugins as needed
- Test your deployment thoroughly
- Set up monitoring and alerts

## 📚 Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
