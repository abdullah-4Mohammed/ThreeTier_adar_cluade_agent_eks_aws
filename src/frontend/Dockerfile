# frontend/Dockerfile
# static page served by nginx; it calls /api on the same host, which the ingress routes to the backend
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
