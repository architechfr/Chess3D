/* SFT Chess - asynchronous UCI bridge. No UI calls inside this module.
 * Stockfish.js attribution and GPL-3.0:
 * https://github.com/nmrugg/stockfish.js
 */
(function(root){
'use strict';
function uciInfo(line){
 if(!/^info\s/.test(line)||!/\bscore (?:cp|mate) -?\d+/.test(line))return null;
 var depth=Number((line.match(/\bdepth (\d+)/)||[])[1]||0);
 var multiPV=Number((line.match(/\bmultipv (\d+)/)||[])[1]||1);
 var cp=line.match(/\bscore cp (-?\d+)/);
 var mate=line.match(/\bscore mate (-?\d+)/);
 var pv=line.match(/\bpv ([a-h][1-8][a-h][1-8][qrbn]?(?:\s+[a-h][1-8][a-h][1-8][qrbn]?)*)/);
 return {depth:depth,multiPV:multiPV,cp:cp?Number(cp[1]):null,mate:mate?Number(mate[1]):null,pv:pv?pv[1].split(/\s+/):[]};
}
class SFTStockfishBridge{
 constructor(workerUrl,workerFactory){
  this.workerUrl=workerUrl||'./vendor/stockfish/stockfish-19-lite-single.js';
  this.workerFactory=workerFactory||function(path){return new Worker(path);};
  this.worker=null;this.readyPromise=null;this.active=null;this.pending=null;
  this.ready=false;this.disposed=false;this.version='19 lite single';
 }
 init(){
  if(this.readyPromise)return this.readyPromise;
  var that=this;
  this.readyPromise=new Promise(function(resolve,reject){
   var timeout=setTimeout(function(){that.fail(new Error('Le moteur Stockfish ne répond pas.'));},15000);
   that._initResolve=function(){clearTimeout(timeout);resolve(true);};
   that._initReject=function(error){clearTimeout(timeout);reject(error);};
   try{
    that.worker=that.workerFactory(that.workerUrl);
    that.worker.onmessage=function(event){that.receive(String(event.data||''));};
    that.worker.onerror=function(event){that.fail(new Error('Chargement Stockfish impossible : '+(event.message||'erreur réseau ou WebAssembly')));};
    that.send('uci');
   }catch(error){that.fail(error);}
  });
  return this.readyPromise;
 }
 send(command){if(this.worker&&!this.disposed)this.worker.postMessage(command);}
 receive(raw){
  var that=this;
  raw.split(/\r?\n/).forEach(function(line){
   line=line.trim();if(!line)return;
   if(line.indexOf('sft-engine-error')===0){that.fail(new Error(line.slice(17)));return;}
   if(line==='uciok'){that.send('setoption name UCI_AnalyseMode value true');that.send('isready');return;}
   if(line==='readyok'&&!that.ready){that.ready=true;if(that._initResolve)that._initResolve();that._initResolve=null;return;}
   if(!that.active)return;
   if(line.indexOf('info ')===0){
    var info=uciInfo(line);
    if(info&&info.depth>=that.active.minDepth){
     var old=that.active.variations[info.multiPV];
     if(!old||info.depth>=old.depth)that.active.variations[info.multiPV]=info;
    }
   }
   if(line.indexOf('bestmove ')===0){
    var task=that.active;that.active=null;
    if(task.timer)clearTimeout(task.timer);
    if(!task.cancelled){
     var match=line.match(/^bestmove (\S+)/),bestmove=match?match[1]:'(none)';
     var variations=Object.keys(task.variations).map(function(k){return task.variations[k];}).sort(function(a,b){return a.multiPV-b.multiPV;});
     task.resolve({fen:task.fen,bestmove:bestmove,variations:variations,profile:task.profile});
    }else task.resolve(null);
    that.pump();
   }
  });
 }
 analyze(config){
  var that=this;
  return this.init().then(function(){
   return new Promise(function(resolve,reject){
    if(that.pending)that.pending.resolve(null);
    that.pending={
     fen:config.fen,profile:config.profile||'club',depth:Math.min(18,Math.max(5,config.depth||11)),
     time:Math.min(2500,Math.max(180,config.time||600)),
     multiPV:Math.min(3,Math.max(1,config.multiPV||1)),
     minDepth:1,variations:{},resolve:resolve,reject:reject,cancelled:false,timer:null
    };
    if(that.active){
     if(!that.active.cancelled){that.active.cancelled=true;that.send('stop');}
    }else that.pump();
   });
  });
 }
 pump(){
  if(!this.ready||this.active||!this.pending||this.disposed)return;
  var that=this,task=this.pending;this.pending=null;this.active=task;
  this.send('setoption name MultiPV value '+task.multiPV);
  this.send('position fen '+task.fen);
  this.send('go depth '+task.depth+' movetime '+task.time);
  task.timer=setTimeout(function(){
   if(that.active===task){
    that.send('stop');
    // If the UCI engine fails to acknowledge stop, restart on the next attempt.
    setTimeout(function(){if(that.active===task)that.fail(new Error('Le moteur est resté bloqué.'));},2500);
   }
  },task.time+3500);
 }
 fail(error){
  var message=error instanceof Error?error:new Error(String(error));
  if(this._initReject){this._initReject(message);this._initReject=null;}
  if(this.active){if(this.active.timer)clearTimeout(this.active.timer);this.active.reject(message);this.active=null;}
  if(this.pending){this.pending.reject(message);this.pending=null;}
  if(this.worker){this.worker.terminate();this.worker=null;}
  this.ready=false;this.readyPromise=null;
 }
 dispose(){
  this.disposed=true;this.fail(new Error('Arrêt du moteur.'));
 }
}
root.SFTStockfishBridge=SFTStockfishBridge;
root.SFTStockfishParseInfo=uciInfo;
})(typeof window!=='undefined'?window:self);
