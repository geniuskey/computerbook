const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'chapters', name + '.html'), 'utf8');
const section = (source, a, b) => {
  const start = source.indexOf(a), end = source.indexOf(b, start);
  assert(start >= 0 && end > start, 'Source section exists: ' + a);
  return source.slice(start, end);
};
let scripts = 0;
for (const name of fs.readdirSync(path.join(root, 'chapters'))) {
  const html = fs.readFileSync(path.join(root, 'chapters', name), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/src\s*=/.test(match[1]) || !match[2].trim()) continue;
    if (/application\/ld\+json/.test(match[1])) JSON.parse(match[2]);
    else { new vm.Script(match[2], { filename: name }); scripts++; }
  }
}
// Exercise the shipped SHA implementation against Node's independent implementation,
// including UTF-8 input and padding boundaries around 56 and 64 bytes.
const security = read('security');
const shaContext = vm.createContext({TextEncoder});
vm.runInContext(section(security, '  const K = [', '  CB.sha256 = sha256;'), shaContext);
const vectors = ['', 'abc', '한글', '🙂', ...Array.from({length:130}, (_,n) => 'a'.repeat(n)), 'A🙂가'.repeat(80)];
for (const text of vectors) assert.equal(shaContext.sha256(text), crypto.createHash('sha256').update(text).digest('hex'));
// Replay the actual teaching sort operations, checking duplicates and all initial shapes.
const algo = read('algo');
const sortContext = vm.createContext({});
vm.runInContext(section(algo, '  function ops(alg, src)', '  const count ='), sortContext);
let sortCases = 0;
for (let n = 1; n <= 80; n += 3) {
  for (const shape of ['asc', 'desc', 'duplicates']) {
    const input = Array.from({length:n}, (_,i) => shape === 'asc' ? i : shape === 'desc' ? n-i : (i*17+3)%11);
    for (const kind of ['bubble', 'insert', 'merge', 'quick']) {
      const data = input.slice();
      for (const op of sortContext.ops(kind, input)) {
        if (op[0] === 's') [data[op[1]],data[op[2]]] = [data[op[2]],data[op[1]]];
        if (op[0] === 'w') data[op[1]] = op[2];
      }
      assert.deepEqual(data, input.slice().sort((a,b)=>a-b)); sortCases++;
    }
  }
}
// The UI's 1e9 steps/s assumption: 2^60 takes 36.6 years; 2^89 exceeds
// the stated 4.35e17-second universe-age comparison, not ten times that age.
const timeContext = vm.createContext({});
vm.runInContext(section(algo, '  const fmtT =', '  const bn =') + '\nthis.fmt=fmtT;', timeContext);
assert.match(timeContext.fmt(2**60/1e9), /년$/);
assert.equal(timeContext.fmt(2**89/1e9), '우주 나이보다 김');
assert.equal(timeContext.fmt(4.35e17), '1.4×10^10년');
// Belady's published sequence; verify the shipped replacement implementation.
const memoryContext = vm.createContext({});
vm.runInContext(section(read('vm'), '  function run(seq, n, kind)', '  function renderRep()'), memoryContext);
const seq = [1,2,3,4,1,2,5,1,2,3,4,5];
for (const [kind,n,expected] of [['fifo',3,9],['fifo',4,10],['lru',3,10],['lru',4,8],['opt',3,7],['opt',4,6]]) assert.equal(memoryContext.run(seq,n,kind).faults, expected);
// Run the shipped flash model with an erasure observer. All logical data must
// already have a valid destination outside the block at the exact erasure event.
const flash = section(read('storage'), '  const NB = 4, NP = 4;', '  function renderFlash(hl)');
let erasures = 0;
const flashContext = vm.createContext({
  document:{}, $:()=>({textContent:'',innerHTML:''}), renderFlash:()=>{},
  watchErase:(old, replacement, bi, blocks, where)=>{
    if (!replacement.every(p=>p.s==='free')) return;
    for (const page of old.filter(p=>p.s==='valid')) {
      const [b,p] = where[page.f[0]];
      assert.notEqual(b,bi,'Destination must be outside erased block');
      assert.equal(blocks[b].pages[p].s,'valid');
      assert.equal(blocks[b].pages[p].f,page.f);
    }
    erasures++;
  }
});
vm.runInContext(flash + `
function observe() {
 blocks.forEach((B, bi) => { let pages=B.pages; Object.defineProperty(B,'pages', { get:()=>pages, set:next=>{watchErase(pages,next,bi,blocks,where);pages=next;} }); });
}
function invariant() {
 let live=0;
 blocks.forEach(B=>B.pages.forEach(p=>{if(p.s==='valid')live++;}));
 if(live!==4)throw Error('Expected four live pages');
 for(const f of 'ABCD'){const [b,p]=where[f];if(blocks[b].pages[p].f!==f+ver[f] || blocks[b].pages[p].s!=='valid')throw Error('Lost newest data');}
 return {uw,fw,er,free:blocks.flatMap(B=>B.pages).filter(p=>p.s==='free').length};
}
this.observe=observe;this.invariant=invariant;`,flashContext);
for (const pattern of ['A','ABCD','AABACAAD','DDCCBBAA']) {
  flashContext.freset();flashContext.observe();
  for(let i=0;i<1200;i++){flashContext.modify(pattern[i%pattern.length]);const r=flashContext.invariant();assert(r.free>=2);assert(r.fw>=r.uw);}
}
assert(erasures>1000);
console.log(JSON.stringify({inlineScripts:scripts,shaVectors:vectors.length,sortCases,pageReplacementCases:6,flashWrites:4800,observedErasures:erasures}));
