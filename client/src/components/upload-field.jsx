import { useState } from 'react';
import { UploadCloud,FileCheck,LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile,openPrivateFile } from '../lib/api';
import { Button } from './ui';
export function UploadField({kind='food',value=[],onChange,label='Add a photo',multiple=false}) {
  const [busy,setBusy]=useState(false);
  async function upload(event){const files=Array.from(event.target.files||[]).slice(0,multiple?5:1);if(!files.length)return;setBusy(true);try{const result=[];for(const file of files){if(file.size>8*1024*1024)throw new Error('Please use files smaller than 8 MB.');result.push((await uploadFile(file,kind)).url);}onChange(multiple?[...value,...result].slice(0,5):result);toast(kind==='document'?'Document attached.':'Photo ready to share.');}catch(error){toast.error(error.message);}finally{setBusy(false);event.target.value='';}}
  return <div className="stack" style={{gap:10}}><label className="upload-zone">{busy?<LoaderCircle className="spin" size={25}/>:<UploadCloud size={25}/>}<strong>{busy?'Uploading with care…':label}</strong><span>{kind==='document'?'PDF, JPG, PNG or WebP':'JPG, PNG or WebP'} · up to 8 MB</span><input aria-label={label} type="file" accept={kind==='document'?'application/pdf,image/jpeg,image/png,image/webp':'image/jpeg,image/png,image/webp'} onChange={upload} disabled={busy} multiple={multiple}/></label>{value.map((url,i)=><div key={url} className="between upload-item"><span className="row"><FileCheck size={16}/> {kind==='document'?'Document':'Photo'} {i+1} attached</span><div className="row"><Button variant="ghost" size="sm" onClick={()=>openPrivateFile(url).catch(e=>toast.error(e.message))} type="button">View</Button><Button variant="ghost" size="sm" type="button" onClick={()=>onChange(value.filter(v=>v!==url))}>Remove</Button></div></div>)}</div>;
}
