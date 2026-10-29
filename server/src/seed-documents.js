import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root } from './config.js';
import { Upload } from './models/index.js';
export async function demoDocument(user,registration) {
  const escape = text=>text.replace(/[^\x20-\x7E]/g,'').replace(/[()\\]/g,'\\$&');
  const lines = ['SHAREBITE - ILLUSTRATIVE DEMO DOCUMENT',user.name,`Registration: ${registration}`,'This is fictional seed data for a hackathon demonstration.','It is not a government registration or real verification.','Submitted for platform review.'];
  const stream = `BT /F1 15 Tf 50 750 Td ${lines.map((line,i)=>`${i?'0 -36 Td ':''}(${escape(line)}) Tj`).join('\n')} ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let pdf='%PDF-1.4\n'; const offsets=[0];
  objects.forEach((object,i)=>{ offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${object}\nendobj\n`; });
  const xref=Buffer.byteLength(pdf); pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const filename=`demo-${user._id}.pdf`, directory=path.join(root,'server','uploads');
  await mkdir(directory,{recursive:true});await writeFile(path.join(directory,filename),pdf);
  const upload=await Upload.create({owner:user._id,filename,mime:'application/pdf',kind:'document'});
  return `/api/uploads/${upload._id}`;
}
