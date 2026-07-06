/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // pptxgenjs (used client-side for .pptx export) statically references
    // node built-ins it only uses in Node. Strip the `node:` scheme and stub
    // those modules in the browser bundle; the export path never calls them.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        http: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },
};

export default nextConfig;
