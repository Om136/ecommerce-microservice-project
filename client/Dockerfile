FROM node:18-alpine

WORKDIR /app

# Install http-server globally
RUN npm install -g http-server

# Copy your static files
COPY . .

# Expose port
EXPOSE 8080

# Start http-server with the home page as the default
CMD ["http-server", "-p", "8080", "--cors", "-c-1", "-o", "/home/home.html"]