# Stage 1: Build Audio Service (Go)
FROM golang:1.21 AS builder
WORKDIR /app/audio
COPY audioFiles/ .
RUN go mod tidy && go build -o audio_server .

# Stage 2: Final Image (Python + Nginx + FFmpeg)
FROM python:3.10-slim

# Install System Dependencies
# - FFmpeg: Video/Audio processing
# - Nginx: Reverse Proxy
# - Procps: For pkill/debugging
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nginx \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Requirements and Install Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Configure Nginx
# Redirect logs to stdout/stderr
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Copy Nginx Conf
COPY nginx.conf .

# Copy Source Code
COPY imageFiles/ ./imageFiles/
COPY textFiles/ ./textFiles/
COPY videoFiles/ ./videoFiles/
# (Note: utility folder might not exist based on previous ls, but good practice to allow if it appears. 
# based on ls, we have audioFiles, imageFiles, textFiles, videoFiles. We'll stick to those.)

# Copy Compiled Audio Server from Builder
COPY --from=builder /app/audio/audio_server ./audioFiles/audio_server
# Copy audio DB schema if needed or ensure code creates it. 
# audioFiles/main.go initializes DB, checking if schema exists might be in code, but schema.sql is likely needed.
COPY audioFiles/schema.sql ./audioFiles/

# Copy Entrypoint
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Environment Variables
ENV PYTHONUNBUFFERED=1

# Expose the port (Render will set PORT env var, we expose 8000 as documentation)
EXPOSE 8000

# Start Command
CMD ["./entrypoint.sh"]
