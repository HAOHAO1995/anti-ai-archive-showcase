import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Public HTML is generated once and shared by people and crawlers. Resolve
  // metadata into <head> before capture, rather than freezing a streamed body
  // fragment whose canonical/hreflang tags require JavaScript to take effect.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
