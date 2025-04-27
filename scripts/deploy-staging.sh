#!/bin/bash
set -e

echo "Starting deployment for staging environment..."

# Docker network
NETWORK_NAME="pplc5-network"

# Create Docker network if it doesn't exist
if ! docker network inspect $NETWORK_NAME &>/dev/null; then
  docker network create $NETWORK_NAME
  echo "Created Docker network: $NETWORK_NAME"
fi

# MySQL setup
MYSQL_CONTAINER="pplc5-mysql"
MYSQL_DATA_DIR="/var/lib/mysql-data"
MYSQL_ROOT_PASSWORD="strongRootPassword"
MYSQL_DATABASE="pplc5db"
MYSQL_USER="ppluser"
MYSQL_PASSWORD="secureUserPassword"

# Create MySQL data directory if it doesn't exist
if [ ! -d "$MYSQL_DATA_DIR" ]; then
  sudo mkdir -p $MYSQL_DATA_DIR
  sudo chown -R 999:999 $MYSQL_DATA_DIR
  echo "Created MySQL data directory: $MYSQL_DATA_DIR"
fi

# Check if MySQL container exists and is running
if docker ps -q -f name=$MYSQL_CONTAINER | grep -q .; then
  echo "MySQL container is already running"
else
  # If container exists but is not running, remove it
  if docker ps -aq -f name=$MYSQL_CONTAINER | grep -q .; then
    echo "Removing existing MySQL container"
    docker rm -f $MYSQL_CONTAINER
  fi
  
  echo "Starting MySQL container..."
  # Create and start MySQL container
  docker run -d \
    --name $MYSQL_CONTAINER \
    --network $NETWORK_NAME \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
    -v $MYSQL_DATA_DIR:/var/lib/mysql \
    -p 127.0.0.1:3306:3306 \
    --restart unless-stopped \
    mysql:8.0
    
  echo "Waiting for MySQL to initialize..."
  sleep 20
fi

# Build and run the application
APP_CONTAINER="pplc5-backend-staging"

# Stop and remove existing application container if it exists
if docker ps -aq -f name=$APP_CONTAINER | grep -q .; then
  echo "Stopping and removing existing application container"
  docker stop $APP_CONTAINER || true
  docker rm $APP_CONTAINER || true
fi

echo "Building application container..."
# Build the Docker image
docker build -t $APP_CONTAINER:latest .

echo "Running database migrations..."
# Run database migrations
docker run --rm \
  --network $NETWORK_NAME \
  -e DATABASE_URL=mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_CONTAINER:3306/$MYSQL_DATABASE \
  $APP_CONTAINER:latest \
  npx prisma migrate deploy

echo "Starting application container..."
# Run the application container
docker run -d \
  --name $APP_CONTAINER \
  --network $NETWORK_NAME \
  -p 8000:8000 \
  -e NODE_ENV=staging \
  -e DATABASE_URL=mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_CONTAINER:3306/$MYSQL_DATABASE \
  -e PORT=8000 \
  -e JWT_SECRET_KEY="a0c99b4077afde9914bfa980944ba48596549c51d4893211e83b53e04cf9995c" \
  -e STAGING_CLIENT_URL="http://localhost:3000" \
  -e SENTRY_ORG="pplc5" \
  -e SENTRY_PROJECT="node-express" \
  -e SENTRY_AUTH_TOKEN="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" \
  --restart unless-stopped \
  $APP_CONTAINER:latest

echo "Deployment completed successfully!"