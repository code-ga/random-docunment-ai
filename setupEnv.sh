#!/bin/sh
# Usage: source ./setupEnv.sh
# Loads environment variables from .env into the current shell session

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found!"
  return 1 2>/dev/null || exit 1
fi

# Export each variable from the .env file
export_envs() {
  source .env
  done < "$ENV_FILE"
}

export_envs

echo "Environment variables from $ENV_FILE loaded."
