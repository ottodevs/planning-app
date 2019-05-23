# Use an official node runtime image as a parent image
FROM node:10-alpine

# These deps are mostly for ganache and deprecated ipfs-api
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual .gyp add \
    g++ \ 
    gcc \
    git \
    go \
    libc6-compat \
    make \
    python \
    rsync \
    bash


# Set the container working directory to /planning-suite
WORKDIR /home/node/app/
# Copy initialization script and give execution permissions
COPY docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh
# Set user to primary user (Should be set from an environment variable)
USER 1000

ENTRYPOINT ["/docker-entrypoint.sh"]
