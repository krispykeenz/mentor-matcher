// next.config.mjs
import withPWA from "next-pwa";
var isDev = process.env.NODE_ENV === "development";
var config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      // Allow Firebase Storage emulator in development
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9199",
        pathname: "/v0/b/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9199",
        pathname: "/v0/b/**"
      }
    ]
  },
  transpilePackages: ["lucide-react"]
};
var next_config_default = withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true
})(config);
export {
  next_config_default as default
};
