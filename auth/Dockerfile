FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1\
    PYTHONUNBUFFERED=1

WORKDIR /app

# Set up a non-root user
ARG UID=10001
RUN adduser --disabled-password --gecos "" --uid "${UID}" app_user

# Install dependencies.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R app_user:app_user /app

USER app_user

EXPOSE 8080

# Allow flexibility in each microservice.
CMD ["sh", "-c", "$CMD"]
