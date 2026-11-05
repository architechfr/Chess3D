'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('stockfish-bridge.js','utf8');
const namespace={};
vm.runInNewContext(code, {window:namespace,self:namespace,console,Promise,setTimeout,clearTimeout,Error,Number,String,Math,Object,Array,RegExp}, {filename:'stockfish-bridge.js'});
class FakeWorker{
  constructor(){this.commands=[];this.onmessage=()=>{};this.terminated=false;}
  send(line){queueMicrotask(()=>{if(!this.terminated)this.onmessage({data:line})});}
  postMessage(cmd){
    this.commands.push(cmd);
    if(cmd==='uci')this.send('uciok');
    if(cmd==='isready')this.send('readyok');
  }
  terminate(){this.terminated=true;}
}
test('UCI parser accepts score and PV, and ignores noise',()=>{
  const parse=namespace.SFTStockfishParseInfo;
  assert.equal(parse('uciok'),null);
  const line=parse('info depth 12 multipv 2 score cp -35 nodes 100 pv g1f3 d7d5');
  assert.equal(line.depth,12);
  assert.equal(line.multiPV,2);
  assert.equal(line.cp,-35);
  assert.equal(line.pv.join(' '),'g1f3 d7d5');
  assert.equal(parse('info depth 13 score mate 2 pv d8h4').mate,2);
});
test('worker handshake and multipv analysis',async()=>{
  const worker=new FakeWorker();
  const engine=new namespace.SFTStockfishBridge('./mock.js',()=>worker);
  await engine.init();
  assert(worker.commands.includes('uci'));
  assert(worker.commands.includes('isready'));
  const result=engine.analyze({fen:'8/8/8/8/8/8/8/K6k w - - 0 1',depth:8,time:250,multiPV:2});
  await new Promise(resolve=>setImmediate(resolve));
  worker.send('info depth 6 multipv 1 score cp 20 pv a1b1 h1g1');
  worker.send('info depth 5 multipv 2 score cp 0 pv a1a2 h1g1');
  worker.send('bestmove a1b1');
  const answer=await result;
  assert.equal(answer.bestmove,'a1b1');
  assert.equal(answer.variations.length,2);
  assert.equal(answer.variations[1].multiPV,2);
  engine.dispose();
  assert.equal(worker.terminated,true);
});
test('old analysis is cancelled when newer position arrives',async()=>{
  const worker=new FakeWorker();
  const engine=new namespace.SFTStockfishBridge('./mock.js',()=>worker);
  await engine.init();
  const first=engine.analyze({fen:'first',time:200});
  await new Promise(resolve=>setImmediate(resolve));
  const second=engine.analyze({fen:'second',time:200});
  await new Promise(resolve=>setImmediate(resolve));
  assert(worker.commands.includes('stop'));
  worker.send('bestmove a2a3');
  await new Promise(resolve=>setImmediate(resolve));
  worker.send('info depth 8 score cp 10 pv b2b3');
  worker.send('bestmove b2b3');
  assert.equal(await first,null);
  assert.equal((await second).bestmove,'b2b3');
  engine.dispose();
});
