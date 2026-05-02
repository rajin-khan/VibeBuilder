# Match Vite engine (^20.19 || >=22.12); avoid non-LTS Node 21 in CI.
# Use AWS Public ECR mirror for official library images so CI avoids Docker Hub
# unauthenticated pull rate limits (TOOMANYREQUESTS).
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

# Husky expects .git; Docker builds have no .git — skip git hooks during install
ENV HUSKY=0

COPY package*.json ./

RUN npm install

COPY . .

ARG ci_build

RUN mkdir -p /app/log

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build:${ci_build}

FROM public.ecr.aws/docker/library/nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf