import React, { useMemo, useRef, useState } from 'react';
import { CONNECTION_PUZZLES, createConnectionGame, getConnectionStatus, hintConnectionGame, rotateConnectionTile } from './connection-game';
import './connection-game.css';

const destinations = [
  { key: 'learning', letter: 'L', title: 'Learning', description: 'An idea becomes a capability.', caseId: 'media-shala' },
  { key: 'communication', letter: 'C', title: 'Communication', description: 'A perspective becomes shared meaning.', caseId: 'paryavaran-baal-sansad' },
  { key: 'ai', letter: 'A', title: 'AI integration', description: 'A tool finds its human purpose.', caseId: 'ai-literacy' },
];
const ports = [{bit:1,name:'north',point:'50 0'},{bit:2,name:'east',point:'100 50'},{bit:4,name:'south',point:'50 100'},{bit:8,name:'west',point:'0 50'}];
function tilePath(mask) {
  const ends=ports.filter(port=>mask&port.bit);
  if(ends.length===2)return `M${ends[0].point} ${ends[0].bit+ends[1].bit===5 || ends[0].bit+ends[1].bit===10?'L':'Q50 50 '}${ends[1].point}`;
  return ends.map(port=>`M50 50L${port.point}`).join(' ');
}
function Mark({type}) {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d={type==='learning'?'M8 28V12l12 4 12-4v16l-12 4-12-4Zm12-12v16':type==='communication'?'M8 9h24v18H21l-7 6v-6H8V9Zm6 7h12m-12 5h8':'M20 5 34 20 20 35 6 20 20 5Zm0 8 7 7-7 7-7-7 7-7Z'} stroke="currentColor" strokeWidth="1.2" /></svg>;
}

export default function ConnectionGame({onOpenCase=()=>{},onExplore=()=>{}}) {
  const [game,setGame]=useState(()=>createConnectionGame());
  const [history,setHistory]=useState([]);
  const [focused,setFocused]=useState(11);
  const [notice,setNotice]=useState('Begin at the gold source. Rotate a path to carry its signal.');
  const refs=useRef([]);
  const status=useMemo(()=>getConnectionStatus(game),[game]);
  const powered=new Set(status.poweredIds);
  const puzzle=CONNECTION_PUZZLES[game.seed];
  function apply(next,action) {
    if(next===game)return;
    setHistory(previous=>[...previous.slice(-99),game]);setGame(next);onExplore();
    const result=getConnectionStatus(next);
    setNotice(result.complete?'All three connections are alive. Shared capability begins with a connected system.':`${action} ${result.connectedCount} of 3 destinations connected.`);
  }
  function turn(id){apply(rotateConnectionTile(game,id),`Tile ${Math.floor(id/5)+1}${String.fromCharCode(65+id%5)} rotated clockwise.`);}
  function hint(){const next=hintConnectionGame(game);apply(next,`Guided turn at ${Math.floor(next.lastHint/5)+1}${String.fromCharCode(65+next.lastHint%5)}. The highlighted tile may need another turn.`);}
  function start(seed){setGame(createConnectionGame(seed));setHistory([]);setNotice('A fresh arrangement. The source and destinations stay fixed.');setFocused(11);}
  function undo(){if(!history.length)return;setGame(history.at(-1));setHistory(history.slice(0,-1));setNotice('Last turn undone. Try another direction.');}
  function navigate(event,id){
    if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)return;
    let next=id;
    if(event.key==='ArrowRight')next=id%5<4?id+1:id;
    else if(event.key==='ArrowLeft')next=id%5>0?id-1:id;
    else if(event.key==='ArrowDown')next=id<20?id+5:id;
    else if(event.key==='ArrowUp')next=id>=5?id-5:id;
    else if(event.key==='Home')next=Math.floor(id/5)*5;
    else if(event.key==='End')next=Math.floor(id/5)*5+4;
    else return;
    event.preventDefault();setFocused(next);refs.current[next]?.focus();
  }
  return <section id="decision-studio" className="connection-section" aria-labelledby="connection-title" data-complete={status.complete}>
    <div className="container">
      <div className="connection-heading"><div><p className="eyebrow">03 / AN EXPERIMENT IN CONNECTION</p><h2 id="connection-title">Nothing works<br /><em>in isolation.</em></h2></div><div className="connection-introduction"><p>A small game about the way I work. Turn the paths. Connect human intention to learning, communication, and AI.</p><p>No clock. No score to chase. Just a system that comes alive when its relationships make sense.</p></div></div>
      <div className="connection-workspace" id="connection-game">
        <div className="connection-instrument">
          <div className="connection-instrument-top"><span>THE CONNECTION GAME</span><span>{String(game.seed+1).padStart(2,'0')} / 03</span></div>
          <div className="connection-board-caption"><span className="connection-source-dot" /><span>HUMAN INTENTION</span><span className="connection-caption-line" /><span>SHARED CAPABILITY</span></div>
          <div className="connection-board-frame">
            <span className="connection-frame-corner corner-nw" aria-hidden="true" /><span className="connection-frame-corner corner-se" aria-hidden="true" />
            <div className="connection-column-labels" aria-hidden="true">{'ABCDE'.split('').map(letter=><span key={letter}>{letter}</span>)}</div>
            <div className="connection-board" role="group" aria-label="Connection puzzle, five rows and five columns" aria-describedby="connection-instructions">
              {game.tiles.map(tile=>{
                const terminal=game.terminals.find(item=>item.id===tile.id);const connected=powered.has(tile.id);const fixed=!tile.rotatable;
                const description=tile.kind==='source'?'Human intention, fixed signal source':terminal?`${terminal.label}, fixed destination, ${connected?'connected':'unconnected'}`:tile.kind==='empty'?'Empty stone, no path':`Path to ${ports.filter(port=>tile.mask&port.bit).map(port=>port.name).join(', ')}, ${connected?'carrying signal':'unconnected'}`;
                return <button key={tile.id} ref={element=>{refs.current[tile.id]=element;}} type="button" className={`connection-tile tile-${tile.kind}${connected?' is-powered':''}${game.lastHint===tile.id?' is-hint':''}`} data-tile={tile.id} data-mask={tile.mask} data-powered={connected} aria-label={`Row ${tile.row+1}, column ${String.fromCharCode(65+tile.col)}. ${description}${tile.rotatable?'. Rotate clockwise':''}`} aria-disabled={fixed || status.complete} tabIndex={focused===tile.id?0:-1} onFocus={()=>setFocused(tile.id)} onKeyDown={event=>navigate(event,tile.id)} onClick={()=>turn(tile.id)}>
                  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path className="connection-channel-shadow" d={tilePath(tile.mask)} /><path className="connection-channel" d={tilePath(tile.mask)} />{connected&&<path className="connection-flow" d={tilePath(tile.mask)} />}{tile.kind==='source'?<g><circle cx="50" cy="50" r="19" className="connection-seal" /><path d="M50 35 65 50 50 65 35 50 50 35Zm0 7 8 8-8 8-8-8 8-8Z" className="connection-source-symbol" /></g>:terminal?<g><circle cx="50" cy="50" r="19" className="connection-seal" /><text x="50" y="57" textAnchor="middle" className="connection-terminal-letter">{destinations.find(item=>item.key===terminal.key).letter}</text></g>:tile.kind==='empty'?<path className="connection-empty-mark" d="M46 50h8M50 46v8" />:ports.filter(port=>tile.mask&port.bit).length>2?<circle cx="50" cy="50" r="2.3" className="connection-junction" />:null}</svg>
                  {tile.rotatable&&<span className="connection-turn-mark" aria-hidden="true">↻</span>}
                </button>;
              })}
            </div>
            <div className="connection-board-scale" aria-hidden="true"><span>INTENT → RELATIONSHIP → POSSIBILITY</span><span>5 × 5</span></div>
          </div>
          <p id="connection-instructions" className="connection-instructions"><strong>Tap a path to rotate it.</strong> Matching ends carry the gold signal. Connect all three lettered destinations. Keyboard: arrow keys move; Enter turns.</p>
          <div className="connection-controls"><button type="button" onClick={hint} disabled={status.complete}><span aria-hidden="true">✧</span> Guide one turn</button><button type="button" onClick={undo} disabled={!history.length}><span aria-hidden="true">↶</span> Undo</button><button type="button" onClick={()=>start(game.seed)}>Reset board</button></div>
        </div>
        <aside className="connection-ledger" aria-label="Puzzle progress">
          <div className="connection-ledger-heading"><p className="micro-label">{status.complete?'THE SYSTEM IS CONNECTED':'ARRANGEMENT '+String(game.seed+1).padStart(2,'0')}</p><h3>{status.complete?'Shared capability.':puzzle.title+'.'}</h3><p>{status.complete?'Different paths. One living whole. Follow a connection into the work behind it.':'One source. Three destinations. Find the relationships that let an intention travel.'}</p></div>
          <div className="connection-metrics"><div><strong>{status.connectedCount}<span>/3</span></strong><span>CONNECTIONS</span></div><div><strong>{game.moves}</strong><span>TURNS</span></div><div><strong>{game.hintsUsed}</strong><span>GUIDED</span></div></div>
          <div className="connection-destinations">{destinations.map(item=><button key={item.key} type="button" className={status.connectedTerminals.includes(item.key)?'is-connected':''} onClick={()=>onOpenCase(item.caseId)}><Mark type={item.key} /><span><small>{status.connectedTerminals.includes(item.key)?'CONNECTED':'AWAITING CONNECTION'}</small><strong>{item.title}</strong><span>{item.description}</span></span><svg className="connection-destination-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.2" /></svg></button>)}</div>
          <div className="connection-message" role="status" aria-live="polite"><span aria-hidden="true">{status.complete?'✧':'·'}</span><p>{notice}</p></div>
          <button type="button" className="connection-next" onClick={()=>start(game.seed+1)}>{status.complete?'Explore the next arrangement':'Try a different arrangement'}<span aria-hidden="true">→</span></button>
        </aside>
      </div>
      <details className="connection-engine-notes"><summary><span>Inside the game</span><span>Geometry, graph traversal, and a solvable system <span aria-hidden="true">+</span></span></summary><div><p>Each arrangement begins as a seeded spanning tree. Its paths are pruned to three destinations, then rotated. Every puzzle has a solution.</p><p>A breadth-first traversal checks matching edges after every turn. The gold flow represents that live result. Guidance follows the constructed solution, one turn at a time.</p><a href="https://github.com/thanishsarah/portfolio/blob/main/src/connection-game.js" target="_blank" rel="noopener noreferrer">Read the game logic ↗</a></div></details>
    </div>
  </section>;
}
