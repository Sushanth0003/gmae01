import React, {useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

type Game="crash"|"mines";
type Tx={id:number; game:Game; amount:number; result:string; delta:number; time:string};

const START=1000;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));

function App(){
  const [email,setEmail]=useState(localStorage.getItem("demo_email")||"");
  const [logged,setLogged]=useState(!!email);
  const [balance,setBalance]=useState(Number(localStorage.getItem("demo_balance")||START));
  const [game,setGame]=useState<Game>("crash");
  const [history,setHistory]=useState<Tx[]>(JSON.parse(localStorage.getItem("demo_history")||"[]"));
  const [bet,setBet]=useState(100);
  const [crashPoint,setCrashPoint]=useState<number|null>(null);
  const [mult,setMult]=useState(1);
  const [running,setRunning]=useState(false);
  const [cashed,setCashed]=useState(false);
  const [mines,setMines]=useState<number[]>([]);
  const [revealed,setRevealed]=useState<number[]>([]);
  const [mineCount,setMineCount]=useState(3);

  useEffect(()=>{localStorage.setItem("demo_balance",String(balance))},[balance]);
  useEffect(()=>{localStorage.setItem("demo_history",JSON.stringify(history))},[history]);

  function login(){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Enter a valid email.");
    localStorage.setItem("demo_email",email); setLogged(true);
  }
  function logout(){localStorage.removeItem("demo_email");setLogged(false);}

  function tx(game:Game,amount:number,result:string,delta:number){
    setHistory(h=>[{id:Date.now(),game,amount,result,delta,time:new Date().toLocaleString()},...h].slice(0,50));
  }

  function startCrash(){
    if(running || bet<1 || bet>balance) return;
    const point=Number((1.01 + Math.pow(Math.random(),2.15)*9.99).toFixed(2));
    setBalance(b=>b-bet); setCrashPoint(point); setMult(1); setRunning(true); setCashed(false);
    const started=Date.now();
    const timer=setInterval(()=>{
      const elapsed=(Date.now()-started)/1000;
      const m=Number(Math.min(point,Math.exp(elapsed*.19)).toFixed(2));
      setMult(m);
      if(m>=point){clearInterval(timer);setRunning(false);tx("crash",bet,"CRASH",0);}
    },60);
  }
  function cashOut(){
    if(!running||cashed) return;
    const win=Math.floor(bet*mult);
    setBalance(b=>b+win); setCashed(true); setRunning(false);
    tx("crash",bet,`CASH OUT @ ${mult.toFixed(2)}x`,win-bet);
  }

  function startMines(){
    if(bet<1||bet>balance) return;
    const pool=Array.from({length:25},(_,i)=>i);
    const chosen:number[]=[];
    while(chosen.length<mineCount){const x=Math.floor(Math.random()*25);if(!chosen.includes(x))chosen.push(x)}
    setMines(chosen);setRevealed([]);setBalance(b=>b-bet);
  }
  function reveal(i:number){
    if(!mines.length||revealed.includes(i)) return;
    setRevealed(r=>[...r,i]);
    if(mines.includes(i)){
      tx("mines",bet,"MINE",0); setMines([]); return;
    }
    const safe=revealed.length+1;
    const multiplier=1+(safe*.17);
    // Demo game: user can cash out after each safe pick.
  }
  function cashMines(){
    if(!mines.length) return;
    const safe=revealed.length;
    if(!safe) return;
    const multiplier=1+safe*.17;
    const win=Math.floor(bet*multiplier);
    setBalance(b=>b+win); tx("mines",bet,`CASH OUT @ ${multiplier.toFixed(2)}x`,win-bet); setMines([]);
  }

  if(!logged) return <div className="auth"><div className="card authCard"><div className="logo">◆ DEMO<span>PLAY</span></div><h1>Play without real money.</h1><p>Demo games only. Credits have no cash value.</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><button onClick={login}>Continue with email</button><small>For production, replace this demo login with Google OAuth or an email OTP provider.</small></div></div>;

  const minesMultiplier=1+revealed.length*.17;
  return <div className="app">
    <header><div className="logo">◆ DEMO<span>PLAY</span></div><nav><button className={game==="crash"?"active":""} onClick={()=>setGame("crash")}>Crash</button><button className={game==="mines"?"active":""} onClick={()=>setGame("mines")}>Mines</button><button onClick={()=>document.getElementById("history")?.scrollIntoView()}>History</button></nav><div className="user">{email} <b>{balance.toLocaleString()} DEMO</b><button onClick={logout}>Log out</button></div></header>
    <main><div className="notice">DEMO MODE — Credits have no monetary value and cannot be deposited, withdrawn, sold, or redeemed.</div>
      {game==="crash" ? <section className="gameLayout"><div className="card game"><h2>CRASH</h2><div className="mult">{mult.toFixed(2)}<span>x</span></div><div className={"rocket "+(!running?"idle":"")}>🚀</div><div className="chart"><div className="line" style={{width:`${clamp((mult-1)/10*100,4,100)}%`}}/></div><div className="controls"><label>Bet <input type="number" min="1" value={bet} onChange={e=>setBet(Number(e.target.value))}/></label><button disabled={running} onClick={startCrash}>PLACE BET</button><button className="secondary" disabled={!running} onClick={cashOut}>CASH OUT</button></div>{!running&&crashPoint&&<p className="result">Round ended at <b>{crashPoint.toFixed(2)}x</b></p>}</div><aside className="card"><h3>How to play</h3><ol><li>Choose demo credits.</li><li>Start the round.</li><li>Cash out before the crash.</li></ol><p className="muted">Game outcomes are generated locally in this prototype. Move the game engine server-side before public deployment.</p></aside></section>
      : <section className="gameLayout"><div className="card game"><h2>MINES</h2><div className="mineTop"><span>{mines.length?minesMultiplier.toFixed(2):"1.00"}x</span><span>{revealed.length}/25 safe</span></div><div className="grid">{Array.from({length:25},(_,i)=>{const open=revealed.includes(i);const isMine=!mines.length&&revealed.includes(i)&&false;return <button key={i} className={open?"tile open":"tile"} onClick={()=>reveal(i)} disabled={!mines.length||open}>{open?"◆":"?"}</button>})}</div><div className="controls"><label>Bet <input type="number" min="1" value={bet} onChange={e=>setBet(Number(e.target.value))}/></label><label>Mines <select value={mineCount} onChange={e=>setMineCount(Number(e.target.value))}><option>3</option><option>5</option><option>7</option></select></label><button disabled={!!mines.length} onClick={startMines}>START</button><button className="secondary" disabled={!mines.length||!revealed.length} onClick={cashMines}>CASH OUT</button></div><p className="muted">A prototype demo. Server-side randomness is required for production.</p></div><aside className="card"><h3>How to play</h3><p>Pick tiles. Safe picks increase the demo multiplier. Cash out before selecting a mine.</p></aside></section>}
      <section id="history" className="card history"><div className="historyHead"><h2>Game history</h2><span>{history.length} rounds</span></div>{history.length===0?<p className="muted">No rounds yet.</p>:<div className="table"><div className="tr head"><span>Game</span><span>Bet</span><span>Result</span><span>Change</span><span>Time</span></div>{history.map(x=><div className="tr" key={x.id}><span>{x.game.toUpperCase()}</span><span>{x.amount}</span><span>{x.result}</span><span className={x.delta>=0?"win":"loss"}>{x.delta>=0?"+":""}{x.delta}</span><span>{x.time}</span></div>)}</div>}</section>
    </main>
  </div>
}
createRoot(document.getElementById("root")!).render(<App/>);
