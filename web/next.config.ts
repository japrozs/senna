import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	reactStrictMode: true,
	transpilePackages: ["@primer/react"],
};

export default nextConfig;
