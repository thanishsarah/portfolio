import { useCallback, useEffect, useRef, useState } from 'react';
import { WORLD, STATIONS, createGame, stepGame, gameCommand, getGameTelemetry, predictTrajectory, serializeProgress, restoreProgress } from './simulation';
import { createSceneRenderer, worldToScreen } from './render-scene';

const SAVE_KEY = 'vt-signal-atlas-v1';
const FIXED_STEP = 1 / 120;
function loadGame() {
  try {
    const saved = restoreProgress(localStorage.getItem(SAVE_KEY));
    if (saved) return saved.recovered.length === STATIONS.length && saved.lastCheckpoint.id === WORLD.dock.id ? { ...saved, phase:'complete' } : saved;
  } catch { /* Storage is optional. */ }
  return createGame();
}
const neutral = () => ({ thrustX:0, thrustY:0, brake:false, scan:false });

export default function useGame({ suspended = false } = {}) {
  const game = useRef(null);
  if (!game.current) game.current = loadGame();
  const [state, setState] = useState(game.current);
  const [visible, setVisible] = useState(!document.hidden);
  const [ready, setReady] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [mapMode, setMapMode] = useState('auto');
  const [effects, setEffects] = useState(() => { try { return localStorage.getItem('vt-motion') !== 'off'; } catch { return true; } });
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [sound, setSound] = useState(false);
  const [eventNote, setEventNote] = useState('Recover three signals, then return to the observatory.');
  const [viewport, setViewport] = useState({ width:innerWidth, height:innerHeight });
  const [stats, setStats] = useState({ fps:0, frameMs:0, step:FIXED_STEP });
  const canvasRef = useRef(null);
  const renderer = useRef(null);
  const camera = useRef(null);
  const keys = useRef(new Set());
  const touch = useRef(neutral());
  const visualTime = useRef(0);
  const effectsRef = useRef(effects && !reduced);
  const modeRef = useRef(mapMode);
  const viewportRef = useRef(viewport);
  const audio = useRef(null);
  const soundRef = useRef(sound);
  const eventSeq = useRef(game.current.eventSeq);
  const trajectory = useRef([]);
  const lastPrediction = useRef(-1);
  effectsRef.current = effects && !reduced;
  modeRef.current = mapMode;
  soundRef.current = sound;

  const clearInputs = useCallback(() => { keys.current.clear(); touch.current = neutral(); }, []);
  const save = useCallback(value => { try { localStorage.setItem(SAVE_KEY, serializeProgress(value)); } catch { /* Flight is still usable without storage. */ } }, []);
  const command = useCallback(action => {
    clearInputs();
    const next = gameCommand(game.current, action);
    game.current = next;
    if (['RESTART','RESPAWN'].includes(action.type)) { lastPrediction.current = -1; camera.current = null; }
    if (action.type === 'RESTART') { eventSeq.current = 0; setEventNote('New expedition ready. Recover three relay signals.'); try { localStorage.removeItem(SAVE_KEY); } catch {} }
    else save(next);
    setState(next);
  }, [clearInputs, save]);
  const focusFlight = useCallback(() => requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll:true })), []);
  const setTouch = useCallback(values => { touch.current = { ...touch.current, ...values }; }, []);

  function readInput() {
    return {
      thrustX:(keys.current.has('KeyD') || keys.current.has('ArrowRight') ? 1:0) - (keys.current.has('KeyA') || keys.current.has('ArrowLeft') ? 1:0) + touch.current.thrustX,
      thrustY:(keys.current.has('KeyS') || keys.current.has('ArrowDown') ? 1:0) - (keys.current.has('KeyW') || keys.current.has('ArrowUp') ? 1:0) + touch.current.thrustY,
      brake:keys.current.has('Space') || touch.current.brake,
      scan:keys.current.has('KeyE') || touch.current.scan,
    };
  }
  function chime(type) {
    if (!soundRef.current || !audio.current) return;
    const context = audio.current;
    [0, .11, .22].forEach((delay,index) => {
      const voice = context.createOscillator(); const gain = context.createGain();
      voice.type = 'sine'; voice.frequency.value = (type === 'captured' ? [160,130,90] : type === 'complete' ? [440,660,880] : [330,440,660])[index];
      const start = context.currentTime + delay;
      gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(.055,start+.018); gain.gain.exponentialRampToValueAtTime(.001,start+.3);
      voice.connect(gain); gain.connect(context.destination); voice.start(start); voice.stop(start+.32);
    });
  }
  function inspectEvents(next) {
    if (next.eventSeq === eventSeq.current) return;
    const events = next.events.filter(event => event.seq > eventSeq.current);
    eventSeq.current = next.eventSeq;
    for (const event of events) {
      if (event.type === 'signal') { const station=STATIONS.find(item=>item.id===event.stationId); setEventNote(`${station?.name || 'Relay'} signal recovered. ${next.recovered.length} of 3 connections restored.`); chime('signal'); }
      if (event.type === 'captured') { clearInputs(); setEventNote('The gravity well captured your probe. Your recovered signals are safe.'); chime('captured'); }
      if (event.type === 'complete') { clearInputs(); setEventNote('Expedition complete. All connections are restored.'); chime('complete'); }
    }
    save(next);
  }

  const draw = useRef(null);
  draw.current = (dt = 0) => {
    if (!renderer.current) return;
    const current = game.current;
    const { width,height } = viewportRef.current;
    const fit = Math.min(width / (WORLD.width + 300), height / (WORLD.height + 300));
    const attract = current.phase === 'ready' && current.recovered.length === 0;
    let desired;
    if (attract) desired = width > 760 ? { x:-490,y:40,zoom:Math.min(width/2100,height/1450) } : { x:-160,y:-400,zoom:.6 };
    else if (modeRef.current === 'sector' || (modeRef.current === 'auto' && width >= 900)) desired = { x:0,y:0,zoom:fit };
    else desired = { x:current.ship.x,y:current.ship.y,zoom:width < 600 ? .57 : .62 };
    if (!camera.current || !effectsRef.current || !dt || attract) camera.current = desired;
    else { const ease=1-Math.exp(-dt*4.5); camera.current = { x:camera.current.x+(desired.x-camera.current.x)*ease,y:camera.current.y+(desired.y-camera.current.y)*ease,zoom:camera.current.zoom+(desired.zoom-camera.current.zoom)*ease }; }
    if (current.time-lastPrediction.current>.18 || lastPrediction.current<0) { trajectory.current=predictTrajectory(current,5); lastPrediction.current=current.time; }
    const input = readInput();
    try { renderer.current.render(current,{ camera:camera.current,motion:effectsRef.current,reducedMotion:!effectsRef.current,trajectory:current.phase==='playing' ? trajectory.current : [],frameTime:visualTime.current,quality:width<600?'low':'high',thrust:Math.min(1,Math.hypot(input.thrustX,input.thrustY)),braking:input.brake }); }
    catch { setRenderError(true); }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    try { renderer.current=createSceneRenderer(canvasRef.current); }
    catch { setRenderError(true); return; }
    const resize = () => {
      const box=canvasRef.current.getBoundingClientRect();
      const size={width:Math.max(1,box.width),height:Math.max(1,box.height)};
      viewportRef.current=size; setViewport(size);
      renderer.current?.resize(size.width,size.height,Math.min(devicePixelRatio || 1,1.6)); camera.current=null; draw.current?.();
    };
    const observer=new ResizeObserver(resize); observer.observe(canvasRef.current); resize(); setReady(true);
    return () => { observer.disconnect(); renderer.current?.destroy(); renderer.current=null; };
  }, []);
  useEffect(() => {
    const media=matchMedia('(prefers-reduced-motion: reduce)'); const change=()=>setReduced(media.matches);
    media.addEventListener('change',change); return()=>media.removeEventListener('change',change);
  }, []);
  useEffect(() => {
    const away=()=>{ clearInputs(); if(game.current.phase==='playing') command({type:'PAUSE'}); };
    const visibility=()=>{ setVisible(!document.hidden); if(document.hidden) away(); };
    document.addEventListener('visibilitychange',visibility); window.addEventListener('blur',away);
    return()=>{document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',away);};
  }, [command,clearInputs]);
  useEffect(() => {
    const down=event=>{
      if(event.ctrlKey || event.metaKey || event.altKey) return;
      if(document.querySelector('dialog[open]') || event.target.closest?.('input,textarea,select,[contenteditable=true]')) return;
      const phase=game.current.phase;
      if(event.code==='Escape' || event.code==='KeyP') { if(event.repeat)return; if(['playing','paused'].includes(phase)){event.preventDefault();command({type:phase==='playing'?'PAUSE':'RESUME'});if(phase==='paused')focusFlight();}return; }
      if(event.code==='KeyR' && phase==='captured'){event.preventDefault();command({type:'RESPAWN'});focusFlight();return;}
      if(event.target.closest?.('button,a,summary')) return;
      if(phase!=='playing') return;
      if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE'].includes(event.code)){event.preventDefault();keys.current.add(event.code);}
      if(event.code==='KeyQ' && !event.repeat){event.preventDefault();const all=[...STATIONS,WORLD.dock];const index=all.findIndex(item=>item.id===game.current.targetId);command({type:'SELECT_TARGET',id:all[(index+1)%all.length].id});}
    };
    const up=event=>keys.current.delete(event.code);
    document.addEventListener('keydown',down);document.addEventListener('keyup',up);
    return()=>{document.removeEventListener('keydown',down);document.removeEventListener('keyup',up);clearInputs();};
  }, [command,clearInputs,focusFlight]);
  useEffect(() => {
    if(!ready || renderError) return;
    draw.current?.();
    const active=visible && !suspended && (state.phase==='playing' || (state.phase==='ready' && effectsRef.current));
    if(!active) return;
    let frame,last=performance.now(),accumulator=0,lastUI=last,statStart=last,frames=0,totalFrame=0;
    const tick=now=>{
      const delta=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
      if(game.current.phase==='playing') {
        accumulator+=delta;let steps=0;
        while(accumulator>=FIXED_STEP && steps<12){game.current=stepGame(game.current,readInput(),FIXED_STEP);accumulator-=FIXED_STEP;steps++;}
        if(steps===12)accumulator=0;
        inspectEvents(game.current);
      } else accumulator=0;
      if(effectsRef.current && ['ready','playing'].includes(game.current.phase))visualTime.current+=delta;
      const before=performance.now();draw.current?.(delta);totalFrame+=performance.now()-before;frames++;
      if(now-lastUI>=90 || game.current.phase!==state.phase){setState(game.current);lastUI=now;}
      if(now-statStart>=1000){setStats({fps:Math.round(frames*1000/(now-statStart)),frameMs:totalFrame/Math.max(1,frames),step:FIXED_STEP});statStart=now;frames=0;totalFrame=0;}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  }, [ready,visible,state.phase,effects,reduced,renderError,suspended]);
  useEffect(()=>{if(ready && state.phase!=='playing')draw.current?.();},[state,mapMode,effects,reduced,ready]);
  useEffect(()=>()=>{audio.current?.close().catch(()=>{});},[]);

  function launch(guided=false) {
    if(game.current.phase==='complete')command({type:'RESTART'});
    command({type:game.current.phase==='paused'?'RESUME':'START'});
    if(guided!==game.current.guidance)command({type:'TOGGLE_GUIDANCE'});
    focusFlight();
  }
  function toggleEffects(){setEffects(value=>{const next=!value;try{localStorage.setItem('vt-motion',next?'on':'off');}catch{}return next;});}
  async function toggleSound(){
    if(!sound){try{const Context=window.AudioContext || window.webkitAudioContext;if(!Context)return;if(!audio.current)audio.current=new Context();await audio.current.resume();setSound(true);}catch{setSound(false);}}
    else setSound(false);
  }
  function choosePoint(event){
    focusFlight();if(!camera.current || game.current.phase!=='playing')return;
    const box=canvasRef.current.getBoundingClientRect();const point={x:event.clientX-box.left,y:event.clientY-box.top};
    let target=null,distance=48;
    for(const item of [...STATIONS,WORLD.dock]){const screen=worldToScreen(item,camera.current,box.width,box.height);const delta=Math.hypot(screen.x-point.x,screen.y-point.y);if(delta<distance){target=item;distance=delta;}}
    if(target)command({type:'SELECT_TARGET',id:target.id});
  }
  return { state,telemetry:getGameTelemetry(state),stats,canvasRef,ready,renderError,command,launch,focusFlight,clearInputs,setTouch,choosePoint,mapMode,setMapMode,effects:effects&&!reduced,reduced,toggleEffects,sound,toggleSound,eventNote,viewport };
}
