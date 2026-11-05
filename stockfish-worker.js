/* SFT Chess - isolated browser loader for Stockfish.js 19 Lite Single.
 * Stockfish.js and its WASM engine are GPL-3.0 licensed:
 * https://github.com/nmrugg/stockfish.js
 * The matching .js and .wasm binaries are copied from the npm package at build
 * time and hosted on the same origin; no cross-origin worker scripts are needed.
 */
'use strict';
const SFT_STOCKFISH_BASE='./vendor/stockfish/';
const SFT_STOCKFISH_NAME='stockfish-19-lite-single.js';
var Module={
  locateFile:function(path){return SFT_STOCKFISH_BASE+path;},
  print:function(line){self.postMessage(String(line));},
  printErr:function(line){if(line)self.postMessage('info string '+String(line));}
};
try{
  importScripts(SFT_STOCKFISH_BASE+SFT_STOCKFISH_NAME);
}catch(error){
  self.postMessage('sft-engine-error '+String(error && error.message || error));
}
