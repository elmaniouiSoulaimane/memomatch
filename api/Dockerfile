FROM python:3.10-alpine

WORKDIR /app

COPY . /app

# Install important dependencies
RUN apk update && \
    apk add --no-cache build-base && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Clean up
RUN rm -rf /var/cache/apk/*

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "src.asgi:application"]