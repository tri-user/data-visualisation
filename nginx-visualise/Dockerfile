# Use the Nginx image
FROM nginx:1.17.10-alpine

RUN rm /etc/nginx/conf.d/default.conf

# Replace with our own nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

