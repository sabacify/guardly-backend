#!/bin/sh

if [ "$NODE_ENV" == "production" ] ; then
  node --loader ts-node/esm ./src/server.ts
else
  nodemon
fi