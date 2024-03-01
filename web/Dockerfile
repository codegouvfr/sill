# build environment
FROM node:18-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
COPY public ./public
RUN yarn install --frozen-lockfile
COPY config-overrides.js tsconfig.json ./
COPY src ./src
RUN sed -i '/"homepage":/d' package.json
RUN yarn build
COPY nginx.conf ./

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf    
WORKDIR /usr/share/nginx
COPY --from=build /app/build ./html
ENTRYPOINT sh -c "nginx -g 'daemon off;'"