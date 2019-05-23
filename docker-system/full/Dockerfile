# Use an official node runtime image as a parent image
FROM node:11

# Set the container working directory to /planning-suite
WORKDIR /home/node/app
# Copy initialization script and give execution permissions
COPY docker-entrypoint.sh /
ENV NODE_PATH=/home/node/app/node_modules
RUN chmod +x /docker-entrypoint.sh
# Set user to primary user (Should be set from an environment variable)
USER 1000

ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 1111 2222 3333 4444 5555 8545 3000