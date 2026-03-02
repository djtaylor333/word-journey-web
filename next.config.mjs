/** @type {import('next').NextConfig} */
// basePath is only needed when deploying to GitHub Pages (sub-path).
// Use NEXT_PUBLIC_GITHUB_PAGES=true in CI before running `next build`.
const isGithubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Required for GitHub Pages — site is served under /word-journey-web/
  basePath: isGithubPages ? '/word-journey-web' : '',
  assetPrefix: isGithubPages ? '/word-journey-web' : '',
};

export default nextConfig;
