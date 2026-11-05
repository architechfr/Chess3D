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
  // Enter focused 2D mode and make sure the board, coach, and exit are visible.
  await page.locator('#sftViewToggle').click();
  await page.locator('#sft2dFullscreen').click();
  await page.waitForFunction(()=>document.querySelector('.shell')?.classList.contains('sft-immersive-2d'));
  assert.equal(await page.locator('header').isVisible(),false);
  assert.equal(await page.locator('.sft-board2d-frame').isVisible(),true);
  assert.equal(await page.locator('.academy-dock').isVisible(),true);
  assert.equal(await page.locator('#sft2dFullscreen').isVisible(),true);
  // Simulate a phone rotated to landscape: board and coach remain side by side.
  await page.setViewportSize({width:900,height:400});
  const boardBox=await page.locator('.sft-board2d-frame').boundingBox();
  const coachBox=await page.locator('.academy-dock').boundingBox();
  assert(boardBox&&coachBox,'2D board and tutor must be laid out');
  assert(boardBox.width>=220,'Board should remain usable on landscape phones');
  assert(coachBox.x>boardBox.x+boardBox.width-10,'Coach should be beside the chessboard');
  assert(boardBox.y>=0&&boardBox.y+boardBox.height<=405,'Full chessboard should remain visible');
  await page.setViewportSize({width:1280,height:720});
  await page.locator('#sft2dFullscreen').click();
  await page.waitForFunction(()=>!document.querySelector('.shell')?.classList.contains('immersive'));
  assert.equal(await page.locator('header').isVisible(),true);
  // Installation guide must have platform-specific steps and a real copy action.
  await page.locator('#installBtn').click();
  // Chromium may show a native PWA prompt instead of the explanatory dialog.
  // Force the help dialog to validate its instructions independently.
  await page.evaluate(()=>window.showInstallHelp());
  assert.equal(await page.locator('#installSteps li').count()>1,true);
  assert.equal(await page.locator('#installCopyLink').isVisible(),true);
  await page.locator('#installClose').click();
  // Simulate an installation event: navigation CTA disappears while gameplay remains.
  await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));
  assert.equal(await page.locator('#installBtn').isVisible(),false);
  assert.equal(await page.locator('.sft-board2d-frame').isVisible(),true);


 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
});
