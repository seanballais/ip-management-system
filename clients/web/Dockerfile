FROM node:22.14-slim AS base

WORKDIR /app

# Set up a non-root user
ARG UID=10001
RUN adduser --disabled-password --gecos "" --uid "${UID}" app_user

# Install dependencies.
COPY package.json .
RUN npm install

RUN chown -R app_user:app_user /app

USER app_user

EXPOSE 8080

CMD ["sh", "-c", "$CMD"]
