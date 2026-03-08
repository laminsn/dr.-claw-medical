#!/bin/bash
set -euo pipefail

# Dr. Claw Medical — n8n Deployment Script
# Run this on the EC2 instance after copying the deployment files.

echo "=== Dr. Claw Medical n8n Deployment ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker not installed. Installing..."; curl -fsSL https://get.docker.com | sh; sudo usermod -aG docker $USER; }
command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1 || { echo "Docker Compose not found. Installing..."; sudo apt-get install -y docker-compose-plugin; }

# Load environment
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and fill in values."
    exit 1
fi

source .env

# Generate encryption key if not set
if [ -z "${N8N_ENCRYPTION_KEY:-}" ] || [ "$N8N_ENCRYPTION_KEY" = "generate-a-random-32-char-string" ]; then
    N8N_ENCRYPTION_KEY=$(openssl rand -hex 16)
    sed -i "s/N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY/" .env
    echo "Generated N8N_ENCRYPTION_KEY"
fi

# Generate DB password if not set
if [ -z "${N8N_DB_PASSWORD:-}" ] || [ "$N8N_DB_PASSWORD" = "generate-a-strong-password" ]; then
    N8N_DB_PASSWORD=$(openssl rand -hex 16)
    sed -i "s/N8N_DB_PASSWORD=.*/N8N_DB_PASSWORD=$N8N_DB_PASSWORD/" .env
    echo "Generated N8N_DB_PASSWORD"
fi

# Start containers
echo "Starting n8n..."
docker compose up -d

# Wait for n8n to be ready
echo "Waiting for n8n to start..."
for i in {1..30}; do
    if curl -sf http://localhost:5678/healthz >/dev/null 2>&1; then
        echo "n8n is ready!"
        break
    fi
    sleep 2
done

# Set up SSL with certbot (if nginx is configured)
if command -v certbot >/dev/null 2>&1 && [ -n "${N8N_HOST:-}" ]; then
    echo "Setting up SSL for $N8N_HOST..."
    sudo certbot --nginx -d "$N8N_HOST" --non-interactive --agree-tos -m admin@$N8N_HOST || echo "SSL setup skipped (may need DNS configured first)"
fi

echo ""
echo "=== Deployment Complete ==="
echo "n8n URL: http://localhost:5678"
echo "n8n API: http://localhost:5678/api/v1"
echo ""
echo "Next steps:"
echo "1. Set up DNS for $N8N_HOST pointing to this server"
echo "2. Run: sudo certbot --nginx -d $N8N_HOST"
echo "3. Create an API key in n8n Settings > API"
echo "4. Add the API key as N8N_API_KEY in Supabase secrets"
echo "5. Add N8N_BASE_URL=https://$N8N_HOST in Supabase secrets"
