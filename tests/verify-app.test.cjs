'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
test('all inline scripts parse',()=>{
  assert(scripts.length>=2);
  for(const [i,src] of scripts.entries())assert.doesNotThrow(()=>new vm.Script(src,{filename:'inline-'+i+'.js'}));
});
test('state FEN serialization roundtrips start, castling, en passant, promotion',()=>{
  const src=scripts[0];
  const core=src.slice(src.indexOf('const FEN='),src.indexOf('// ==== WebGL'));
  const serialize=src.slice(src.indexOf('function serializeFen('),src.indexOf('function deepMoveFromUCI('));
  const sandbox={};
  const get=vm.runInNewContext(core+'\n'+serialize+'\n({parseFen,serializeFen})',sandbox);
  for(const fen of [
   'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
   '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
   '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
   '4k3/P7/8/8/8/8/8/4K3 w - - 0 1'
  ])assert.equal(get.serializeFen(get.parseFen(fen)),fen);
});
test('external Stockfish engine, controls and fallback are wired',()=>{
  for(const id of ['deepAnalyze','deepProfile','deepEngineReport','deepEngineStatus'])assert(html.includes('id="'+id+'"'));
  assert(html.includes('src="./stockfish-bridge.js"'));
  assert(fs.readFileSync('service-worker.js','utf8').includes('stockfish-worker.js'));
});
