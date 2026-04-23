#!/bin/bash
set -e

MONGO_DATA_DIR="/home/runner/workspace/mongodb-data"
MONGO_LOG="$MONGO_DATA_DIR/mongod.log"
MONGO_LOCK="$MONGO_DATA_DIR/mongod.lock"

mkdir -p "$MONGO_DATA_DIR"

# Start MongoDB if not already running
if ! pgrep -x mongod > /dev/null 2>&1; then
  echo "Starting MongoDB..."
  mongod --dbpath "$MONGO_DATA_DIR" \
         --bind_ip 127.0.0.1 \
         --port 27017 \
         --fork \
         --logpath "$MONGO_LOG" \
         --logappend 2>&1
  sleep 2
  echo "MongoDB started"
else
  echo "MongoDB already running"
fi

# Run the Node.js server
exec node server.js
