#!/bin/bash

# Script to generate secure secrets for Strapi CMS deployment
# Run this script and add the generated values to your GitHub Secrets

echo "=========================================="
echo "Strapi CMS - Secret Generator"
echo "=========================================="
echo ""
echo "Copy these values to your GitHub Repository Secrets:"
echo "Go to: Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "=========================================="
echo ""

echo "APP_KEYS (4 keys separated by commas):"
KEY1=$(openssl rand -base64 32 | tr -d '\n')
KEY2=$(openssl rand -base64 32 | tr -d '\n')
KEY3=$(openssl rand -base64 32 | tr -d '\n')
KEY4=$(openssl rand -base64 32 | tr -d '\n')
echo "$KEY1,$KEY2,$KEY3,$KEY4"
echo ""

echo "API_TOKEN_SALT:"
openssl rand -base64 32
echo ""

echo "ADMIN_JWT_SECRET:"
openssl rand -base64 32
echo ""

echo "TRANSFER_TOKEN_SALT:"
openssl rand -base64 32
echo ""

echo "ENCRYPTION_KEY:"
openssl rand -base64 32
echo ""

echo "JWT_SECRET:"
openssl rand -base64 32
echo ""

echo "=========================================="
echo "Additional Secrets (Enter manually):"
echo "=========================================="
echo ""
echo "STRIPE_SECRET_KEY: [Get from Stripe Dashboard]"
echo "STRIPE_WEBHOOK_SECRET: [Get from Stripe Dashboard]"
echo "RESEND_API_KEY: [Get from Resend Dashboard]"
echo "FRONTEND_URL: [Your frontend URL, e.g., https://myapp.com]"
echo ""
echo "=========================================="
echo "Deployment Secrets:"
echo "=========================================="
echo ""
echo "VPS_HOST: [Your VPS IP address]"
echo "VPS_USERNAME: [SSH username, e.g., root or ubuntu]"
echo "VPS_SSH_KEY: [Your private SSH key - see DEPLOYMENT.md]"
echo "GH_PAT: [GitHub Personal Access Token - see DEPLOYMENT.md]"
echo ""
echo "=========================================="
echo "Done! Save these values securely."
echo "=========================================="
