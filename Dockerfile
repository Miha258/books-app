FROM node:latest

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Rebuild bcrypt for the current environment
RUN npm rebuild bcrypt --build-from-source
# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]