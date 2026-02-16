#!/bin/bash

# Replace __PORT__ with the actual environment variable PORT (defaulting to 8000 if not set)
PORT=${PORT:-8000}
# sed replacement for nginx config
sed -i "s/__PORT__/$PORT/g" nginx.conf

echo "--- Starting Originality Engine Services [Port: $PORT] ---"

# Function to kill all background processes on exit
cleanup() {
    echo "Shutting down services..."
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT SIGTERM

# 1. Start Audio Server (Go) - Precompiled
echo "[Audio] Starting..."
cd audioFiles
./audio_server &
echo "[Audio] Started."
cd ..

# 2. Start Image Server (Python)
echo "[Image] Starting..."
cd imageFiles
python main.py &
echo "[Image] Started."
cd ..

# 3. Start Text Server (Python)
echo "[Text] Starting..."
cd textFiles
python server.py &
echo "[Text] Started."
cd ..

# 4. Start Video Server (Python)
echo "[Video] Starting..."
cd videoFiles
python server.py &
echo "[Video] Started."
cd ..

# 5. Start Nginx
echo "[Nginx] Starting..."
nginx -c $(pwd)/nginx.conf -g "daemon off;" &
NGINX_PID=$!
echo "[Nginx] Started with PID $NGINX_PID."

# Wait for Nginx (foreground process equivalent)
wait $NGINX_PID
