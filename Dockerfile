# this aggregates the sill-web and sill-api into a single file
# to take advantage of docker cache

# build step
FROM node:18 as build
RUN npm install -g pnpm@8
RUN npm install -g @vercel/ncc@0.36.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/
COPY api/.env.sh api/
COPY web/package.json web/
COPY web/public/ web/public/

RUN pnpm install --frozen-lockfile

COPY api/ api/
COPY web/ web/

RUN pnpm --dir=api build
RUN pnpm --dir=web build

WORKDIR /app/api
RUN rm -r src
RUN cp dist src
RUN npx ncc build src/main.js



# ----- api only ------
# to build only back run
# docker build . --target api --tag my-api-tag`
FROM node:18-alpine as api
RUN npm install -g forever@4.0.3
RUN apk add --no-cache \
  git \
  openssh-client \
  ca-certificates
COPY --from=build /app/api/dist/index.js .
# For reading the version number
COPY --from=build /app/package.json .
ENTRYPOINT sh -c "forever index.js"



## ----- web only ------
# to build only front run
# docker build . --target web --tag my-web-tag
FROM nginx:stable-alpine as web
COPY --from=build /app/web/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx
COPY --from=build /app/web ./html
ENTRYPOINT sh -c "nginx -g 'daemon off;'"








