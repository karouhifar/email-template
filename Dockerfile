# Use the official Bun image for linux/amd64 to match AWS Lambda’s expected architecture
FROM --platform=linux/amd64 oven/bun:latest AS base
WORKDIR /usr/src/app

# Copy all application files into the image
COPY . .

# Set production environment
ENV NODE_ENV=production

# Install production dependencies
RUN bun install --frozen-lockfile --production

# [Optional] Build your application if needed
RUN bun run build

# Remove the default entrypoint that may be causing issues
RUN rm -f /usr/local/bin/docker-entrypoint.sh

# Create a Lambda-compatible bootstrap file that starts your app.
# Adjust the command below if your Lambda handler logic is different.
RUN echo '#!/bin/sh\nexec bun run index.ts' > /var/runtime/bootstrap \
    && chmod +x /var/runtime/bootstrap

# Optionally switch to a non-root user if desired
USER bun

# Override the default entrypoint with the Lambda bootstrap
ENTRYPOINT ["/var/runtime/bootstrap"]
