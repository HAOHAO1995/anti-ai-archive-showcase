export const appearanceKey='archive-appearance';
export function validAppearance(value){return value==='light'||value==='dark';}
// Run before the page is painted so the default paper theme and saved preferences apply before painting.
export const appearanceBootstrap=`(()=>{let theme='light';try{const query=new URLSearchParams(location.search).get('preview-theme');const saved=localStorage.getItem('${appearanceKey}');const old=sessionStorage.getItem('archive-preview-theme');const value=[query,saved,old].find(v=>v==='light'||v==='dark');if(value)theme=value;if(value)localStorage.setItem('${appearanceKey}',theme);}catch{}const root=document.documentElement;root.dataset.theme=theme;root.classList.toggle('dark',theme==='dark');})();`;
