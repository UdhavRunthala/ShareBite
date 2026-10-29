import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];
try{
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://localhost:5173/login',{waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Demo Mode'}).waitFor();
    await page.screenshot({path:`.cache/screenshots/auth-${width}.png`,fullPage:true});
    for(const role of ['Donor','NGO','Admin']){
      await page.goto('http://localhost:5173/login');
      await page.getByRole('button',{name:`Login as ${role}`,exact:true}).click();
      await page.waitForURL('http://localhost:5173/');
      if(!await page.evaluate(()=>Boolean(localStorage.getItem('sharebite-token'))))throw new Error('Demo session missing');
    }
    await page.getByRole('button',{name:'Sign out'}).click();
    await page.goto('http://localhost:5173/settings');
    await page.waitForURL('**/login');
    await page.close();
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('All demo roles, logout and protected redirects passed at desktop/mobile widths.');
}finally{await browser.close();}
