import process from "node:process";

/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

new URL(apiUrl);

const nextConfig = {
  logging: {
    serverFunctions: false,
    // El enlace de confirmacion contiene una credencial de un solo uso.
    incomingRequests: { ignore: [/^\/auth\/confirmar(?:[/?]|$)/] },
  },
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
};

export default nextConfig;
