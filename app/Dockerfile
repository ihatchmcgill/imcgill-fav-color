FROM node:18-slim
WORKDIR /usr/app

COPY package*.json tsconfig*.json .eslintrc.js ./
COPY src ./src/
RUN npm ci --ignore-scripts \
&& npm run build \
&& npm prune --production

ENV NODE_ENV='production'
USER node
EXPOSE 8080
CMD [ "node", "dist/index.js" ]
