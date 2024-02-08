# Use a smaller base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Define environment variables
ENV PORT=8000 \
    PGUSER="pejnknrh" \
    PGHOST="kesavan.db.elephantsql.com" \
    PGPASSWORD="qXT842XB8H2N_FL1Zoe4hjVN5HMOz7ku" \
    PGDATABASE="pejnknrh" \
    PGPORT=5432

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies and cleanup
RUN npm install && \
    rm -rf package*.json

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to run your application
CMD ["node", "index.js"]
