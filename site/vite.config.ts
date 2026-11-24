import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import {defineConfig} from 'vite';

export default defineConfig(async()=>{
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';
  const {cloudflare}=await import('@cloudflare/vite-plugin');
  return {
    css:{postcss:{plugins:[tailwindcss()]}},
    server:process.env.CODEX_SANDBOX==='seatbelt'
      ? {watch:{useFsEvents:false,usePolling:true}}
      : undefined,
    plugins:[vinext(),cloudflare({
      configPath:'./wrangler.jsonc',
      viteEnvironment:{name:'rsc',childEnvironments:['ssr']},
    })],
  };
});
