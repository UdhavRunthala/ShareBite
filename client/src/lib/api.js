import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({ defaultOptions:{ queries:{ staleTime:15000,retry:1,refetchOnWindowFocus:true } } });
export async function api(path,options={}) {
  const token=localStorage.getItem('sharebite-token');
  const form=options.body instanceof FormData;
  const response=await fetch(`/api${path}`,{...options,headers:{...(!form?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...options.headers},body:options.body?(form?options.body:JSON.stringify(options.body)):undefined});
  const data=await response.json().catch(()=>({message:'The server returned an unexpected response.'}));
  if(!response.ok) { const error=new Error(data.message||'We couldn’t complete that request.');error.status=response.status;throw error; }
  return data;
}
export const query = (key,path,options={})=>({ queryKey:Array.isArray(key)?key:[key],queryFn:()=>api(path),...options });
export async function uploadFile(file,kind) { const body=new FormData();body.append('file',file);body.append('kind',kind);return api('/uploads',{method:'POST',body}); }
export async function openPrivateFile(url) { const response=await fetch(url,{headers:{Authorization:`Bearer ${localStorage.getItem('sharebite-token')}`}});if(!response.ok) throw new Error('We couldn’t open this document.');const blobUrl=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=blobUrl;link.target='_blank';link.rel='noopener';link.click();setTimeout(()=>URL.revokeObjectURL(blobUrl),60000); }
