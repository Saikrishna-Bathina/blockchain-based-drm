# Stage 1: Build
FROM golang:1.21-alpine AS builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY audioFiles/ .
RUN go mod tidy && go build -o audio_server .

# Stage 2: Final
FROM alpine:latest
RUN apk add --no-cache ca-certificates libc6-compat
WORKDIR /app
COPY --from=builder /app/audio_server .
COPY audioFiles/schema.sql .
EXPOSE 8080
CMD ["./audio_server"]
