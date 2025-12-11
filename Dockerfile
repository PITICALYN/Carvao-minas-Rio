# Estágio de Build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio de Produção
FROM nginx:alpine

# Copiar a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos gerados no build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
