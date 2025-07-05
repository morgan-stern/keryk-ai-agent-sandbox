#!/bin/bash

# Create certificates directory
mkdir -p certificates

# Generate self-signed certificate for local development
openssl req -x509 -out certificates/localhost.crt -keyout certificates/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.12.124\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

echo "✅ HTTPS certificates generated in ./certificates/"
echo ""
echo "To use HTTPS, run:"
echo "npm run dev:https"