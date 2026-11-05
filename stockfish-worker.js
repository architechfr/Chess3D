/* SFT Chess - isolated browser loader for Stockfish.js 19 Lite Single.
 * Stockfish.js and its WASM engine are GPL-3.0 licensed:
 * https://github.com/nmrugg/stockfish.js
 * The CDN is a temporary online distribution path; a self-hosted vendor copy
 * of the two matching files is recommended for reliable/offline production.
 */
'use strict';
const SFT_STOCKFISH_BASE='https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/';
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
