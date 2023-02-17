var V=Object.defineProperty;var U=(t,s,e)=>s in t?V(t,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[s]=e;var Y=(t,s,e)=>(U(t,typeof s!="symbol"?s+"":s,e),e);import{j as jsxRuntimeExports,r as random,a as reactExports,c as client}from"./vendor-cd7d93c1.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function e(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerpolicy&&(i.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?i.credentials="include":o.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=e(o);fetch(o.href,i)}})();const jsx=jsxRuntimeExports.jsx,jsxs=jsxRuntimeExports.jsxs,EMPTY=0,MAX=1,MIN=2,WALL=3,boardLength=15,boardCenter=boardLength/2>>0,arrayN=(t,s=null)=>Array(t).fill(s),debounce=(t,s=20)=>{let e=+new Date;return(...n)=>{+new Date-e>s&&t(...n),e=+new Date}},range=t=>s=>Array(s-t).fill(null).map((e,n)=>t+n),range0=range(0),l1$1=2**0,d2$1=2**3,l2$1=2**6,l2x2$1=l2$1*2,d3$1=2**9,l3$1=2**12,d4$1=2**14,l4$1=2**16,l5$1=2**18,chessModeBit={l1:l1$1,d2:d2$1,l2:l2$1,d3:d3$1,l3:l3$1,d4:d4$1,l4:l4$1,l5:l5$1,l2x2:l2x2$1},getPointMode=t=>({l1:t&7,d2:(t&56)>>3,l2:(t&960)>>6,d3:(t&7680)>>9,l3:(t&12288)>>12,d4:(t&49152)>>14,l4:(t&196608)>>16,l5:(t&786432)>>18}),Score={l1:10,d2:10,d3:200,l2:150,l2x2:300,l3:200,d4:2e3,l4:5e3,l5:1e4,win:1e5};console.warn("todo: 测试 countLine 是否正确");const countLine=(t,s,e)=>n=>{let o=1;for(let i=0;i<n.length;i++){const l=n[i];if(i<4)o<<=1,l===t?o+=1:(l===s||l===e)&&(o=1);else if(i===4)o<<=1,o+=1;else{if(l===s||l===e)break;o<<=1,l===t&&(o+=1)}}return o},generateAllModes=t=>{let s=[],e=2**(t+1);for(;e-- >0;)s.push("0b"+e.toString(2));return s},allModes=generateAllModes(11),isLive1=t=>/010/.test(t)&&t.length>5,isDead2=t=>/10{0,1}1/.test(t)&&t.length>=5,isLive2=t=>[/000110/,/001100/,/011000/,/001010/,/010100/].some(s=>s.test(t)),isLive2x2=t=>/0101010/.test(t),isDead3=t=>[/111/,/1011/,/1101/,/11001/,/10011/,/10101/].some(s=>s.test(t))&&t.length>=5,isLive3=t=>[/010110/,/011010/,/01110/,/1010101/].some(s=>s.test(t)),isDead4=t=>[/11110/,/01111/,/11011/,/11101/,/10111/].some(s=>s.test(t)),isLive4=t=>[/011110/,/1011101/,/11011011/,/111010111/].some(s=>s.test(t)),is5=t=>/1{5}/.test(t),stat={};allModes.forEach(t=>stat[t]=null);const serialPointMode=[];allModes.forEach(t=>isLive1(t.slice(3))&&(stat[t]="l1")&&(serialPointMode[+t]=l1$1));allModes.forEach(t=>isDead2(t.slice(3))&&(stat[t]="d2")&&(serialPointMode[+t]=d2$1));allModes.forEach(t=>isLive2(t.slice(3))&&(stat[t]="l2")&&(serialPointMode[+t]=l2$1));allModes.forEach(t=>isDead3(t.slice(3))&&(stat[t]="d3")&&(serialPointMode[+t]=d3$1));allModes.forEach(t=>isLive2x2(t.slice(3))&&(stat[t]="l2x2")&&(serialPointMode[+t]=l2x2$1));allModes.forEach(t=>isLive3(t.slice(3))&&(stat[t]="l3")&&(serialPointMode[+t]=l3$1));allModes.forEach(t=>isDead4(t.slice(3))&&(stat[t]="d4")&&(serialPointMode[+t]=d4$1));allModes.forEach(t=>isLive4(t.slice(3))&&(stat[t]="l4")&&(serialPointMode[+t]=l4$1));allModes.forEach(t=>is5(t.slice(3))&&(stat[t]="l5")&&(serialPointMode[+t]=l5$1));console.log("未构成棋型的组合, 这一部分已经验证",Object.keys(stat).filter(t=>!stat[t]).map(t=>t.slice(3)));console.warn("todo: 验证以下棋型是否正确");Object.keys(Score).forEach(t=>{console.log(t,Object.keys(stat).filter(s=>stat[s]===t).map(s=>s.slice(3)))});console.log({allModes,serialPointMode});class Zobrist{constructor({size:s}){this.max=arrayN(s).map(n=>arrayN(s).map(()=>random.int(0,1073741824))),this.min=arrayN(s).map(n=>arrayN(s).map(()=>random.int(0,1073741824))),this.code=random.int(0,1073741824),this.hash={}}go(s,e,n){this.code^=n?this.max[s][e]:this.min[s][e]}get(){return this.hash[this.code]}set(s){this.hash[this.code]=s}resetHash(){this.hash={}}}const{l1,d2,l2,l2x2,d3,l3,d4,l4,l5}=chessModeBit;function evaluate(t,s){const e=this.winner;if(e===MAX)return Score.win;if(e===MIN)return-Score.win;if(t)return 0;let n=0,o=0,i=0,l=0,r=0,h=0,u=0,a=0,p=0,g=0,f=0,b=0,m=0,L=0,j=0,W=0;const B=(c,$)=>{if($<34)return;const N=serialPointMode[$];if(N)if(c===MAX)switch(N){case l1:return a++;case d2:return u++;case l2:return h++;case l2x2:return h+=2;case d3:return r++;case l3:return l++;case d4:return i++;case l4:return o++;case l5:return n++;default:return console.error("error")}else switch(N){case l1:return W++;case d2:return j++;case l2:return L++;case l2x2:return L+=2;case d3:return m++;case l3:return b++;case d4:return f++;case l4:return g++;case l5:return p++;default:return console.error("error")}},w=(c,$,N)=>{let v=1,F=0,X=!1;for(let M=0;M<15;M++){const d=N&3;if(N>>=2,d===$||d===WALL){B(c,v),v=1,X=!0;continue}else if(d===EMPTY)if(F===0)F++,v<<=1;else{v<<=1,(N&12)===EMPTY&&M!==14&&(v<<=1),B(c,v),v=4,(N&12)===EMPTY&&M!==14&&(v<<=1),F=0,X=!0;continue}else F=0,X=!1,v<<=1,v+=1}X||B(c,v)};for(let c=0;c<this.node0.length;c++)w(MAX,MIN,this.node0[c]);for(let c=0;c<this.node1.length;c++)w(MAX,MIN,this.node1[c]);for(let c=0;c<this.node2.length;c++)w(MAX,MIN,this.node2[c]);for(let c=0;c<this.node3.length;c++)w(MAX,MIN,this.node3[c]);for(let c=0;c<this.node0.length;c++)w(MIN,MAX,this.node0[c]);for(let c=0;c<this.node1.length;c++)w(MIN,MAX,this.node1[c]);for(let c=0;c<this.node2.length;c++)w(MIN,MAX,this.node2[c]);for(let c=0;c<this.node3.length;c++)w(MIN,MAX,this.node3[c]);s&&(console.log({maxL1:a,maxD2:u,maxL2:h,maxD3:r,maxL3:l,maxD4:i,maxL4:o,maxL5:n}),console.log({minL1:W,minD2:j,minL2:L,minD3:m,minL3:b,minD4:f,minL4:g,minL5:p}));let D=0,E=0;if((this.seekDepth&1)===0){if(o||i)return Score.l5;if(g||b&f)return-Score.l5;l&&(g||(D+=Score.l4),l>1&&(D+=Score.l3*2))}else{if(g||f)return-Score.l5;if(o||l&i)return Score.l5;b&&(o||(E+=Score.l4),b>1&&(E+=Score.l3*2))}return h>2&&(D+=Score.l2),L>2&&(E+=Score.l2),D=Score.l5*n+Score.l4*o+Score.d4*i+Score.l3*l+Score.d3*r+Score.l2*h+Score.d2*u+Score.l1*u,E=Score.l5*p+Score.l4*g+Score.d4*f+Score.l3*b+Score.d3*m+Score.l2*L+Score.d2*j+Score.l1*j,D*this.attackFactor-E*this.defenseFactor}function genChilds(t,s,e){let n=[],o=[],i=[],l=[],r=[],h=[],u=[],a=[],p=[],g=[],f=[],b=[],m=[],L=[],j=[],W=[],B=[],w=[],D=[],E=[],G=[],H=[],c=[],$=[],N=[],v=[],F=[],X=[];for(let M=0;M<t.length;M++){const d=t[M],[C,y]=d;let x=getPointMode(this.maxPointsScore[C][y][0]);const S=getPointMode(this.maxPointsScore[C][y][1]),k=getPointMode(this.maxPointsScore[C][y][2]),P=getPointMode(this.maxPointsScore[C][y][3]);x.l5+=S.l5+k.l5+P.l5,x.l4+=S.l4+k.l4+P.l4,x.d4+=S.d4+k.d4+P.d4,x.l3+=S.l3+k.l3+P.l3,x.d3+=S.d3+k.d3+P.d3,x.l2+=S.l2+k.l2+P.l2,x.d2+=S.d2+k.d2+P.d2,x.l1+=S.l1+k.l1+P.l1;const{l5:A,l4:K,d4:_,l3:T,d3:O,l2:R,d2:z,l1:q}=x;A?n.push(d):K?i.push(d):T&&_?c.push(d):T>1?G.push(d):R>2?F.push(d):T?u.push(d):R>1?N.push(d):_?r.push(d):R?f.push(d):O?p.push(d):z?m.push(d):q===4?j.push(d):q===3?B.push(d):D.push(d)}for(let M=0;M<t.length;M++){const d=t[M],[C,y]=d;let x=getPointMode(this.minPointsScore[C][y][0]);const S=getPointMode(this.minPointsScore[C][y][1]),k=getPointMode(this.minPointsScore[C][y][2]),P=getPointMode(this.minPointsScore[C][y][3]),A={...x};A.l5+=x.l5+S.l5+k.l5+P.l5,A.l4+=x.l4+S.l4+k.l4+P.l4,A.d4+=x.d4+S.d4+k.d4+P.d4,A.l3+=x.l3+S.l3+k.l3+P.l3,A.d3+=x.d3+S.d3+k.d3+P.d3,A.l2+=x.l2+S.l2+k.l2+P.l2,A.d2+=x.d2+S.d2+k.d2+P.d2,A.l1+=x.l1+S.l1+k.l1+P.l1;const{l5:K,l4:_,d4:T,l3:O,d3:R,l2:z,d2:q,l1:Z}=A;K?o.push(d):_?l.push(d):O&&T?$.push(d):O>1?H.push(d):z>2?X.push(d):O?a.push(d):z>1?v.push(d):T?h.push(d):z?b.push(d):R?g.push(d):q?L.push(d):Z===4?W.push(d):Z===3?w.push(d):E.push(d)}if(s){if(e)return n.length?n:o.length?[]:i.length?i:c.length||r.length?c.concat(r):l.length||h.length?[]:G.length?G:u.length?u:[];if(n.length)return n;if(o.length)return o;if(i.length)return i;if(l.length)return l;const M=c.concat($).concat(G).concat(H).concat(F).concat(X).concat(u).concat(a).concat(N).concat(v).concat(r).concat(h).concat(p).concat(g).concat(f).concat(b).concat(j).concat(B).concat(m).concat(L).concat(D);return M.length<=this.genLimit?M:M.slice(0,this.genLimit)}else{if(o.length)return o;if(n.length)return n;if(l.length)return l;if(i.length)return i;const M=$.concat(c).concat(H).concat(G).concat(X).concat(F).concat(a).concat(u).concat(v).concat(N).concat(h).concat(r).concat(g).concat(p).concat(b).concat(f).concat(W).concat(w).concat(L).concat(m).concat(E);return M.sort((d,C)=>d[0]-C[0]),M.length<=this.genLimit?M:M.slice(0,this.genLimit)}}class Gobang{constructor(t){this.init({...t})}init({firstHand:t,seekDepth:s,autoPlay:e,enableStats:n,attackFactor:o,defenseFactor:i}){this.totalChessPieces=boardLength*boardLength,this.initNode(),this.stack=[],this.zobrist=new Zobrist({size:boardLength}),this.maxPointsScore=arrayN(boardLength).map(l=>arrayN(boardLength,[0,0,0,0])),this.minPointsScore=arrayN(boardLength).map(l=>arrayN(boardLength,[0,0,0,0])),this.stats={},this.enableStats=n!==void 0?n:!0,this.enableLog=!1,this.firstHand=t||MIN,this.genLimit=60,this.seekDepth=s||4,this.seekKillDepth=17,this.autoPlay=e,this.attackFactor=o||1,this.defenseFactor=i||2}isWall(t,s){return t<0||t>=boardLength||s<0||s>=boardLength}initNode(){this.node0=arrayN(boardLength,0);const t=new ArrayBuffer(4*15);this.node1=new Int32Array(t);for(let s=0;s<=14;s++)this.node1[s]=0;this.node2=[];for(let s=0;s<boardLength*2-1;s++){let e=0;for(let n=0;n<15;n++){const o=s-n;e<<=2,this.isWall(n,o)&&(e+=3)}this.node2[s]=e}this.node3=[];for(let s=0;s<boardLength*2-1;s++){let e=0;for(let n=0;n<15;n++){const o=14+n-s;e<<=2,this.isWall(n,o)&&(e+=3)}this.node3[s]=e}}put(t,s,e){this.zobrist.go(t,s,e===MAX),this.stack.push([t,s]),this.node0[t]=this.node0[t]|e<<2*(14-s),this.node1[s]=this.node1[s]|e<<2*(14-t),this.node2[t+s]=this.node2[t+s]|e<<2*(14-t),this.node3[14+t-s]=this.node3[14+t-s]|e<<2*(14-t),this.updateFourLineScore(t,s)}rollback(t=1){if(!(this.stack.length<t))for(;t-- >0;){const[s,e]=this.stack.pop();this.zobrist.go(s,e,this.getChess(s,e)===MAX);const n=2*(14-e);this.node0[s]=(this.node0[s]|3<<n)^3<<n;const o=2*(14-s);this.node1[e]=(this.node1[e]|3<<o)^3<<o,this.node2[s+e]=(this.node2[s+e]|3<<o)^3<<o,this.node3[14+s-e]=(this.node3[14+s-e]|3<<o)^3<<o,this.updateFourLineScore(s,e)}}maxGo(){if(this.isFinal)return;this.zobrist.resetHash(),this.initStats();let t;this.stack.length>4&&(console.time("thinking kill"),t=this.minimax(this.seekKillDepth,!0),console.timeEnd("thinking kill")),(t==null?void 0:t.score)>=Score.win?console.warn("算杀成功 :)"):(console.time("thinking"),t=this.minimax(this.seekDepth),console.timeEnd("thinking"));const{i:s,j:e}=t;return this.put(s,e,MAX),this.logStats(),t}minGo(t,s){if(!this.isFinal)return this.isEmptyPosition(t,s)?(this.put(t,s,MIN),!0):!1}minRepent(){this.stack.length>=2&&this.rollback(2)}isEmptyPosition(t,s){return!this.isWall(t,s)&&this.getChess(t,s)===EMPTY}getNearPositions(t){const s=[],[n,o]=t;for(let i=-2;i<=2;i++)for(let l=-2;l<=2;l++)this.isEmptyPosition(i+n,l+o)&&s.push([i+n,l+o]);return s}getAllOptimalNextStep(){if(this.stack.length===0)return[[boardCenter,boardCenter]];if(this.stack.length===1){if(this.isEmptyPosition(boardCenter,boardCenter))return[[boardCenter,boardCenter]];const s=boardCenter+(Math.random()>.5?1:-1),e=boardCenter+(Math.random()>.5?1:-1);return[[s,e]]}let t=[];for(let s=0;s<boardLength;s++)for(let e=0;e<boardLength;e++)this.getChess(s,e)===EMPTY&&this.haveNeighbor(s,e)&&t.push([s,e]);return t}haveNeighbor(t,s){for(let n=-2;n<=2;n++)if(!(n+t<0||n+t>=boardLength))for(let o=-2;o<=2;o++){if(o+s<0||o+s>=boardLength||n===0&&o===0)continue;if(this.getChess(n+t,s+o)!==EMPTY)return!0}return!1}getChess(t,s){return this.node0[t]>>2*(14-s)&3}minimax(t,s,e=-1/0,n=1/0,o=!0){if(this.isFinal||t===0)return{score:evaluate.call(this,s),depth:t};const i=genChilds.call(this,this.getAllOptimalNextStep(),o,s);if(!(i!=null&&i.length))return{score:0};if(o){let l=-1/0,r=i[0];for(const a of i){const[p,g]=a;this.put(p,g,MAX),this.enableStats&&this.stats.abCut.eva++;let f=this.zobrist.get();if(f===void 0?(f=this.minimax(t-1,s,e,n,!o).score,this.zobrist.set(f),this.enableStats&&this.stats.zobrist.miss++):this.enableStats&&this.stats.zobrist.hit++,this.rollback(),f>l&&(l=f,r=a),e=Math.max(e,l),n<=e){this.enableStats&&this.stats.abCut.cut++;break}}const[h,u]=r;return{score:l,i:h,j:u}}else{let l=1/0,r=i[0];for(const a of i){const[p,g]=a;this.put(p,g,MIN),this.enableStats&&this.stats.abCut.eva++;let f=this.zobrist.get();if(f===void 0?(f=this.minimax(t-1,s,e,n,!o).score,this.zobrist.set(f),this.enableStats&&this.stats.zobrist.miss++):this.enableStats&&this.stats.zobrist.hit++,this.rollback(),f<l&&(l=f,r=a),n=Math.min(n,l),n<=e){this.enableStats&&this.stats.abCut.cut++;break}}const[h,u]=r;return{score:l,i:h,j:u}}}getChessInFourDirection(t,s,e){let n=[],o=[],i=[],l=[];if(e===void 0||e===0){const r=this.node0[t],h=s>=4?r>>2*(18-s)&3:3,u=s>=3?r>>2*(17-s)&3:3,a=s>=2?r>>2*(16-s)&3:3,p=s>=1?r>>2*(15-s)&3:3,g=r>>2*(14-s)&3,f=s<=13?r>>2*(13-s)&3:3,b=s<=12?r>>2*(12-s)&3:3,m=s<=11?r>>2*(11-s)&3:3,L=s<=10?r>>2*(10-s)&3:3;if(n=[h,u,a,p,g,f,b,m,L],e===0)return n}if(e===void 0||e===1){const r=this.node1[s],h=t>=4?r>>2*(18-t)&3:3,u=t>=3?r>>2*(17-t)&3:3,a=t>=2?r>>2*(16-t)&3:3,p=t>=1?r>>2*(15-t)&3:3,g=r>>2*(14-t)&3,f=t<=13?r>>2*(13-t)&3:3,b=t<=12?r>>2*(12-t)&3:3,m=t<=11?r>>2*(11-t)&3:3,L=t<=10?r>>2*(10-t)&3:3;if(o=[h,u,a,p,g,f,b,m,L],e===1)return o}if(e===void 0||e===2){const r=this.node2[t+s],h=t>=4?r>>2*(18-t)&3:3,u=t>=3?r>>2*(17-t)&3:3,a=t>=2?r>>2*(16-t)&3:3,p=t>=1?r>>2*(15-t)&3:3,g=r>>2*(14-t)&3,f=t<=13?r>>2*(13-t)&3:3,b=t<=12?r>>2*(12-t)&3:3,m=t<=11?r>>2*(11-t)&3:3,L=t<=10?r>>2*(10-t)&3:3;if(i=[h,u,a,p,g,f,b,m,L],e===2)return i}if(e===void 0||e===3){const r=this.node3[14+t-s],h=t>=4?r>>2*(18-t)&3:3,u=t>=3?r>>2*(17-t)&3:3,a=t>=2?r>>2*(16-t)&3:3,p=t>=1?r>>2*(15-t)&3:3,g=r>>2*(14-t)&3,f=t<=13?r>>2*(13-t)&3:3,b=t<=12?r>>2*(12-t)&3:3,m=t<=11?r>>2*(11-t)&3:3,L=t<=10?r>>2*(10-t)&3:3;if(l=[h,u,a,p,g,f,b,m,L],e===3)return l}return[n,o,i,l]}getPositionsInFourDirection(t,s){let e=[],n=[],o=[],i=[];const l=t-4>0?t-4:0,r=t+4<boardLength-1?t+4:boardLength-1,h=s-4>0?s-4:0,u=s+4<boardLength-1?s+4:boardLength-1;for(let a=h;a<=u;a++)e.push([t,a]);for(let a=l;a<=r;a++)n.push([a,s]);for(let a=4;a>0;a--)t-a>=l&&s+a<=u&&o.push([t-a,s+a]);o.push([t,s]);for(let a=1;a<=4;a++)t+a<=r&&s-a>=h&&o.push([t+a,s-a]);for(let a=4;a>0;a--)t-a>=l&&s-a>=h&&i.push([t-a,s-a]);i.push([t,s]);for(let a=1;a<=4;a++)t+a<=r&&s+a<=u&&i.push([t+a,s+a]);return[e,n,o,i]}updateFourLineScore(t,s){const e=this.getPositionsInFourDirection(t,s);for(let n=0;n<4;n++){const o=e[n];for(let i=0;i<o.length;i++){const l=o[i];this.updatePointScore(l,n)}}}updatePointScore(t,s){const[e,n]=t;this.getChess(e,n)!==EMPTY?(this.maxPointsScore[e][n]=[0,0,0,0],this.minPointsScore[e][n]=[0,0,0,0]):(this.maxPointsScore[e][n][s]=this.evaPoint(e,n,MAX,s),this.minPointsScore[e][n][s]=this.evaPoint(e,n,MIN,s))}evaPoint(t,s,e,n){const o=this.getChessInFourDirection(t,s,n),r=countLine(e===MAX?MAX:MIN,e===MAX?MIN:MAX,WALL);let h=0;const u=r(o),a=serialPointMode[u];return h+=a||0,h}test(data){eval(data)}get winner(){if(this.stack.length<7)return null;const[t,s]=this.stack[this.stack.length-1],e=this.getChess(t,s),n=this.getChessInFourDirection(t,s);for(let o=0;o<4;o++){let i=0;const l=n[o];for(let r=0;r<l.length;r++)if(l[r]===e?i++:i=0,i===5)return e}return null}get winnerPositions(){if(!this.winner)return null;const[t,s]=this.stack[this.stack.length-1],e=this.getChess(t,s),n=this.getPositionsInFourDirection(t,s);for(let o=0;o<4;o++){const i=n[o];let l=0,r=[];for(let h=0;h<i.length;h++){const[u,a]=i[h];if(this.getChess(u,a)===e?(l++,r.push([u,a])):(l=0,r=[]),l===5)return r}}return null}get isFinal(){return!!this.winner||this.isBoardFull}get isBoardFull(){return this.stack.length===this.totalChessPieces}get lastChessPosition(){return this.stack.length?this.stack[this.stack.length-1]:null}get isDraw(){return this.isBoardFull&&!this.winner}get node(){return this.node0.map(t=>{let s=[];for(let e=0;e<boardLength;e++)s.push((t&3<<2*e)>>2*e);return s.reverse()})}printNode(){console.log(this.node0.map(t=>t.toString(2))),console.log(this.node1.map(t=>t.toString(2))),console.log(this.node2.map(t=>t.toString(2))),console.log(this.node3.map(t=>t.toString(2)))}initStats(){this.stats={abCut:{all:this.genLimit**this.seekDepth,eva:0,cut:0,toString(){const{all:t,eva:s,cut:e}=this.stats.abCut,n=t-s;return`AB剪枝 最大节点总数:${t} 理论最少评估${t**.5>>0} 实际评估:${s} 剪去:${e}/${n}`}},zobrist:{miss:0,hit:0,toString(){const{hit:t,miss:s}=this.stats.zobrist;return`zobrist 评估节点数:${this.stats.abCut.eva} hit:${t} miss:${s}`}}}}logStats(){this.enableStats&&Object.keys(this.stats).forEach(t=>{console.log(this.stats[t].toString.call(this))})}}Y(Gobang,"MAX",MAX),Y(Gobang,"MIN",MIN),Y(Gobang,"EMPTY",EMPTY),Y(Gobang,"WALL",WALL);const App$1="",num="",Num=()=>jsx("div",{className:"num",children:range0(boardLength).map(t=>jsx("div",{className:"item",children:boardLength-t},t))}),abc="",ABC=()=>jsx("div",{className:"abc",children:["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"].map(t=>jsx("div",{className:"item",children:t},t))}),Time=()=>{const[t,s]=reactExports.useState(0);return reactExports.useEffect(()=>{const e=setInterval(()=>{s(n=>n+.2)},200);return()=>clearInterval(e)},[]),jsx("div",{className:"",children:t.toFixed(1)})};function WorkerWrapper(){return new Worker("/gobang/dist/assets/worker-bfde7afb.js")}let gobang=new Gobang,worker=new WorkerWrapper;window.test=t=>worker.postMessage({type:"test",data:t});const Square=({position:t,value:s,onClick:e,isLastChess:n,isMarkPoint:o,isWinnerPoint:i})=>{const l=gobang.stack.findIndex(r=>r[0]===t[0]&&r[1]===t[1]);return jsxs("button",{className:`square ${n&&"lastChess"}`,onClick:e,children:[s!==Gobang.EMPTY&&jsx("div",{className:["chess",s===gobang.firstHand?"black":"white",i?"pulse":""].join(" "),children:l+1||null}),o&&jsx("div",{className:"markPoint"})]})},Board=({squares:t,onClick:s})=>{const e=gobang.lastChessPosition,n=gobang.winner,o=n?gobang.winnerPositions:null;return jsxs("div",{className:"boardCenter",children:[jsx("div",{className:"rowLines",children:range0(boardLength).map(i=>jsx("div",{className:"item"},i))}),jsx("div",{className:"colLines",children:range0(boardLength).map(i=>jsx("div",{className:"item"},i))}),jsx("div",{className:"chesses",children:range0(boardLength).map(i=>jsx("div",{className:"boardRow",children:range0(boardLength).map(l=>jsx(Square,{position:[i,l],value:t[i][l],isLastChess:e&&e[0]===i&&e[1]===l,isWinnerPoint:o&&o.some(([r,h])=>r===i&&h===l),isMarkPoint:i===3&&l===3||i===3&&l===11||i===7&&l===7||i===11&&l===3||i===11&&l===11,onClick:()=>s(i,l)},l))},i))}),jsxs("div",{className:"gameoverTip",children:[gobang.isDraw&&jsx("div",{className:"tip",children:"和棋~"}),n&&jsx("div",{className:"tip",children:n===gobang.firstHand?"黑方胜":"白方胜"})]})]})},Game=()=>{const[t,s]=reactExports.useState(!1),[e,n]=reactExports.useReducer(b=>b+1,0),[o,i]=reactExports.useState(!1),[l,r]=reactExports.useState(!1),h=gobang.isFinal,u=(b,m)=>{if(console.log({start:t,isFinal:h,thinking:o}),!t)return console.log({start:t});if(h)return console.log({isFinal:h});if(o)return console.log({thinking:o});if(l)return console.log({autoPlay:l});worker.postMessage({type:"minGo",data:[b,m]})},a=()=>{i(!0),worker.postMessage({type:"maxGo"})},p=()=>{s(!1)},g=(b,m)=>{s(!0),r(m),worker.postMessage({type:"init",data:{firstHand:b,autoPlay:m,seekDepth:m?2:void 0}})},f=()=>{worker.postMessage({type:"minRepent"})};return reactExports.useEffect(()=>{worker.onmessage=b=>{const{type:m,gobang:L,data:j}=b.data;switch(gobang=JSON.parse(L),console.log("message from worker",m,gobang,j),n(),m){case"init":gobang.firstHand===Gobang.MAX&&!gobang.autoPlay&&a();break;case"minGo":j&&a();break;case"maxGo":i(!1);break}}},[]),jsxs("div",{className:"game",children:[jsxs("div",{className:"gameInfo",children:[jsx(Time,{}),jsx("div",{className:""})]}),jsxs("div",{className:"gameBoard",children:[jsx(Num,{}),jsxs("div",{className:"center",children:[jsx(ABC,{}),jsx(Board,{squares:gobang.node,onClick:debounce(u,20)}),jsx(ABC,{})]}),jsx(Num,{})]}),jsxs("div",{className:"opbtns",children:[t&&jsx("button",{onClick:p,children:"重来"}),!t&&jsx("button",{onClick:()=>g(Gobang.MAX),children:"电脑先手"}),!t&&jsx("button",{onClick:()=>g(Gobang.MIN),children:"玩家先手"}),!t&&jsx("button",{onClick:()=>g(Gobang.MAX,!0),children:"电脑vs电脑"}),t&&jsx("button",{onClick:()=>{f()},children:"悔棋"})]}),jsxs("div",{className:"game-info",children:[gobang.winner&&jsx("div",{children:gobang.winner===Gobang.MAX?"少侠请努力":"干得漂亮"}),jsx("ol",{})]})]})},App=Game,index="";client.createRoot(document.getElementById("root")).render(jsx(App,{}));