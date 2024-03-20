# build environment
FROM node:18-alpine3.17 as build
WORKDIR /app
COPY package.json yarn.lock .env.sh ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN rm -r src
RUN mv dist src
RUN npm install -g @vercel/ncc@0.36.1
# Will generate dist/index.js
RUN npx ncc build src/main.js

# production environment
FROM node:18-alpine3.17
RUN apk add --no-cache \
  git \
  openssh-client \
  ca-certificates
COPY --from=build /app/dist/index.js .    
# For reading the version number
COPY --from=build /app/package.json .
RUN npm install -g forever@4.0.3
ENTRYPOINT sh -c "forever index.js"