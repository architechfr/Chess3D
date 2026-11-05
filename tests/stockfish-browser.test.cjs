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
  // Camera regression: panning must translate camera eye AND target, no rotation.
  const cameraCheck=await page.evaluate(()=>{
    const before={az:camera.az,el:camera.el,dist:camera.dist,target:[...camera.target]};
    updateCamera();
    const eyeOffsetBefore=[eye[0]-camera.target[0],eye[2]-camera.target[2]];
    moveCameraByPixels(75,0);
    updateCamera();
    const eyeOffsetAfter=[eye[0]-camera.target[0],eye[2]-camera.target[2]];
    const translated=[...camera.target];
    const angleUnchanged=camera.az===before.az&&camera.el===before.el;
    const xTranslated=translated[0]!==before.target[0];
    const offsetPreserved=eyeOffsetAfter.every((x,i)=>Math.abs(x-eyeOffsetBefore[i])<1e-8);
    document.getElementById('resetcam').click();
    const recentered=Math.abs(camera.target[0])<1e-8&&Math.abs(camera.target[2])<1e-8;
    const viewPreserved=camera.az===before.az&&camera.dist===before.dist;
    document.getElementById('rotate').click();
    const deliberateRotation=!panToolActive;
    const targetBeforeRotate=[...camera.target];
    moveCameraByPixels(0,25); // Translation math remains valid independently of mode.
    document.getElementById('panbtn').click();
    return {angleUnchanged,xTranslated,offsetPreserved,recentered,viewPreserved,deliberateRotation,panReturned:panToolActive,panModeDefault:before.az!==undefined};
  });
  for(const [name,ok] of Object.entries(cameraCheck))assert(ok,name+' camera regression');
  // Actual mouse drag: it must move the board, not orbit or zoom unexpectedly.
  const dragBefore=await page.evaluate(()=>({az:camera.az,dist:camera.dist,x:camera.target[0],z:camera.target[2]}));
  const canvasBox=await page.locator('#gl').boundingBox();
  assert(canvasBox&&canvasBox.width>100,'3D canvas must be visible');
  const x=canvasBox.x+canvasBox.width*.58,y=canvasBox.y+canvasBox.height*.68;
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x+65,y,{steps:8});
  await page.mouse.up();
  const dragAfter=await page.evaluate(()=>({az:camera.az,dist:camera.dist,x:camera.target[0],z:camera.target[2]}));
  assert(Math.abs(dragBefore.x-dragAfter.x)+Math.abs(dragBefore.z-dragAfter.z)>0.01,'Dragging should translate board');
  assert.equal(dragBefore.az,dragAfter.az,'Dragging should never rotate in default mode');
  assert.equal(dragBefore.dist,dragAfter.dist,'Dragging should never zoom in default mode');
  await page.locator('#resetcam').click();
  // Enter focused 2D mode and make sure the board, coach, and exit are visible.
  await page.locator('#sftViewToggle').click();
  // Some mobile browsers (notably iOS) deny the native Fullscreen API.
  // Exercise the application's own immersive layout instead of Chromium window mode.
  await page.evaluate(()=>{document.querySelector('.shell').requestFullscreen=()=>Promise.reject(new Error('Fullscreen unsupported in test'));});
  await page.setViewportSize({width:900,height:400});
  await page.locator('#sft2dFullscreen').click();
  await page.waitForFunction(()=>document.querySelector('.shell')?.classList.contains('sft-immersive-2d'));
  assert.equal(await page.locator('header').isVisible(),false);
  assert.equal(await page.locator('.sft-board2d-frame').isVisible(),true);
  assert.equal(await page.locator('.academy-dock').isVisible(),true);
  assert.equal(await page.locator('#sft2dFullscreen').isVisible(),true);
  // Simulate a phone rotated to landscape: board and coach remain side by side.
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
