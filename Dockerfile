FROM node:20 as builder
WORKDIR /app
COPY package.json /app
RUN yarn --quiet
COPY . /app
# RUN yarn build

# FROM nginx
# EXPOSE 80
# COPY --from=builder /app/build /usr/share/nginx/html
# Expose application port
EXPOSE 3000

# Start the application
CMD yarn start