#!/bin/bash
export PATH="/home/node/app/node_modules/.bin:$PATH"
npm run start:dev
exec "$@"