# Use Node.js 18
FROM node:18-slim

# Set Working Directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy Source Code
COPY . .

# Environment Variables
ENV NODE_ENV=production

# Expose Port
EXPOSE 5000

# Start Command
CMD ["npm", "start"]
