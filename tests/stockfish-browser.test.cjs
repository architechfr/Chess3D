'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.wasm':'application/wasm','.css':'text/css'};
function startServer(){
 return new Promise((resolve)=>{
  const server=http.createServer((req,res)=>{
   const pathname=decodeURI(new URL(req.url,'http://localhost').pathname);
   const siteRoot=path.join(process.cwd(),'dist');
   const safe=path.resolve(siteRoot,'.'+(pathname==='/'?'/index.html':pathname));
   if(!safe.startsWith(siteRoot+path.sep)){res.writeHead(403);res.end();return;}
   fs.readFile(safe,(err,bytes)=>{if(err){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(safe)]||'application/octet-stream'});res.end(bytes);
   });
  });
  server.listen(0,'127.0.0.1',()=>resolve(server));
 });
}
test('Stockfish 19 Lite starts in a real browser worker', {timeout:75000},async()=>{
 const server=await startServer();
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage();
  const port=server.address().port;
  // The app loads the bridge through the page's normal script tag.
  await page.goto('http://127.0.0.1:'+port+'/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof window.SFTStockfishBridge==='function',{timeout:15000});
  const data=await page.evaluate(async()=>{
   const bridge=new window.SFTStockfishBridge('./vendor/stockfish/stockfish-19-lite-single.js');
   try{
    const result=await bridge.analyze({
     fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
     depth:6,time:500,multiPV:1,profile:'club'
    });
    return {bestmove:result?.bestmove,variants:result?.variations?.length};
   }finally{bridge.dispose();}
  });
  assert.match(data.bestmove,/^[a-h][1-8][a-h][1-8][qrbn]?$/);
  assert(data.variants>=1);
  // Exercise the actual SFT Chess coach, not only the bridge library.
  await page.locator('#deepAnalyze').click({timeout:12000});
  await page.waitForFunction(()=>{
   const state=document.getElementById('deepEngineStatus')?.textContent||'';
   return state.includes('Prêt');
  },null,{timeout:25000});
  const report=await page.locator('#deepEngineReport').textContent();
  assert.match(report,/proposition|Variante|coup|moteur/i);

 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
});
