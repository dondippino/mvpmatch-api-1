# Use Node 16 alpine as parent image
FROM node:16-alpine

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of project files into this image
COPY . .

RUN awk -v ORS='\\n' '1'  .env > .env

# Expose application port
EXPOSE 5090

# Start the application
CMD npm run start

ENTRYPOINT ["sh", "-c", "set -a; . .env; set +a"]