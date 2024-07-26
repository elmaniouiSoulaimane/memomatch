FROM python:3.10

# Set environment variables
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=VD9uw5-+Vr_+Sd;
ENV POSTGRES_DB=memos

# Install PostgreSQL
RUN apt-get update && \
    apt-get install -y postgresql postgresql-contrib && \
    service postgresql start \

# Switch to user postgres and setup the database
USER postgres

# Initialize PostgreSQL, create the database and user, and grant privileges
RUN service postgresql start && \
    su - postgres -c "psql --command \"CREATE DATABASE ${POSTGRES_DB};\"" && \
    su - postgres -c "psql --command \"CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';\"" && \
    su - postgres -c "psql --command \"GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};\""

# Switch back to root user
USER root

# Copy the current api directory contents into the container at /app
COPY api /api

# Set the working directory to /app
WORKDIR /api


# Install important dependencies
RUN pip install psycopg2 \
    && pip install --upgrade pip  \
    && pip install -r requirements.txt  \
    && rm -rf /var/cache/apk/*

RUN service postgresql start
USER postgres


EXPOSE 8000
