'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'dist');
const engineSrc=path.join(root,'node_modules','stockfish','bin');
const name='stockfish-19-lite-single';
if(!fs.existsSync(path.join(engineSrc,name+'.js'))||!fs.existsSync(path.join(engineSrc,name+'.wasm'))){
 throw new Error('Stockfish 19 Lite absent : exécuter npm install avant npm run build');
}
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','stockfish-bridge.js','stockfish-worker.js','service-worker.js','manifest.webmanifest']){
 fs.copyFileSync(path.join(root,file),path.join(out,file));
}
fs.cpSync(path.join(root,'icons'),path.join(out,'icons'),{recursive:true});
const dest=path.join(out,'vendor','stockfish');
fs.mkdirSync(dest,{recursive:true});
for(const ext of ['.js','.wasm'])fs.copyFileSync(path.join(engineSrc,name+ext),path.join(dest,name+ext));
const wasm=fs.statSync(path.join(dest,name+'.wasm')).size;
console.log('SFT Chess prêt :',out);
console.log('Stockfish local chargé :',name,'WASM',wasm,'octets');
