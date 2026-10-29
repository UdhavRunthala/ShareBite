import { mkdir,writeFile,copyFile } from 'node:fs/promises';
import { sourcePhotos as photos } from '../server/src/seed-data.js';
await mkdir('server/seed-assets',{recursive:true});
for(let start=0;start<photos.length;start+=4) {
  await Promise.all(photos.slice(start,start+4).map(async(url,offset)=>{
    const index=start+offset+1,path=`server/seed-assets/food-${String(index).padStart(2,'0')}.jpg`;
    try { const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error(String(response.status));await writeFile(path,Buffer.from(await response.arrayBuffer()));console.log(`Saved food ${index}`); }
    catch { await copyFile('client/public/hero-food.jpg',path);console.log(`Food ${index}: used bundled food photograph fallback`); }
  }));
}
