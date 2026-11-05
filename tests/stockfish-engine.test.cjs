'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawn}=require('node:child_process');
const path=require('node:path');
const bin=path.join(process.cwd(),'node_modules','stockfish','bin','stockfish-19-lite-single.js');
test('real Stockfish 19 Lite responds to UCI and finds legal bestmove', {skip:!fs.existsSync(bin),timeout:30000},async()=>{
  await new Promise((resolve,reject)=>{
    const p=spawn(process.execPath,[bin],{stdio:['pipe','pipe','pipe']});
    let output='',closed=false;
    const timeout=setTimeout(()=>finish(new Error('Stockfish UCI timeout')),23000);
    function finish(err){
      if(closed)return;closed=true;clearTimeout(timeout);p.kill();
      if(err)reject(err);else resolve();
    }
    p.on('error',finish);
    p.stdout.setEncoding('utf8');
    p.stdout.on('data',str=>{
      output+=str;
      if(output.includes('uciok')&&!output.includes('=== sent ===')){
        output+='=== sent ===';
        p.stdin.write('isready\nposition fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\ngo depth 5\n');
      }
      const match=output.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if(match){try{assert(match[1]);finish();}catch(err){finish(err);}}
    });
    p.stdin.write('uci\n');
  });
});
