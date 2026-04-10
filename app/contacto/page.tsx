'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────
   Particle (canvas)
───────────────────────────────────────── */
const COLORS = ['#595fb1', '#8448ac', '#eb6f6f', '#827989'];

class Particle {
  x=0;y=0;size=1;speedX=0;speedY=0;color='#595fb1';alpha=0.2;life=150;age=0;W:number;H:number;
  constructor(W:number,H:number){this.W=W;this.H=H;this.reset();}
  reset(){this.x=Math.random()*this.W;this.y=Math.random()*this.H;this.size=Math.random()*1.4+0.3;this.speedX=(Math.random()-.5)*.15;this.speedY=(Math.random()-.5)*.15;this.color=COLORS[Math.floor(Math.random()*COLORS.length)];this.alpha=Math.random()*.35+.08;this.life=Math.random()*200+100;this.age=0;}
  update(){this.x+=this.speedX;this.y+=this.speedY;this.age++;if(this.age>this.life||this.x<0||this.x>this.W||this.y<0||this.y>this.H)this.reset();}
  draw(ctx:CanvasRenderingContext2D){ctx.save();ctx.globalAlpha=this.alpha*(1-this.age/this.life);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();ctx.restore();}
}

/* ─────────────────────────────────────────
   CSS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500&display=swap');

.lovr-root*,.lovr-root*::before,.lovr-root*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d0e10;--bg2:#111213;--bg3:#0a0a0c;
  --primary:#595fb1;--primary-dim:#595fb133;--primary-mid:#595fb177;
  --red:#eb6f6f;--purple:#8448ac;
  --white:#dcd9de;--white-dim:#dcd9de99;--gray:#827989;
  --border:#1e1f25;--border2:#2a2b30;
}
.lovr-root{background:var(--bg);color:var(--white);font-family:'Outfit',sans-serif;overflow-x:hidden;cursor:none;position:relative;min-height:100vh;}
::selection{background:#595fb144;color:var(--white);}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}

/* cursor */
.lovr-cursor{position:fixed;width:10px;height:10px;background:var(--white);border-radius:50%;pointer-events:none;z-index:9999;transition:transform .15s ease;mix-blend-mode:difference;}
.lovr-cursor-ring{position:fixed;width:36px;height:36px;border:1px solid var(--primary-mid);border-radius:50%;pointer-events:none;z-index:9998;transition:width .3s,height .3s,border-color .3s;}
.lovr-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;}
.lovr-noise{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");background-size:200px;}
.lovr-wrapper{position:relative;z-index:2;}

/* nav */
.lovr-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.6rem 3rem;display:flex;align-items:center;justify-content:space-between;background:rgba(13,14,16,.82);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);}
.lovr-nav-logo{font-family:'DM Serif Display',serif;font-size:1.6rem;letter-spacing:.06em;background:linear-gradient(130deg,var(--red),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-decoration:none;cursor:none;}
.lovr-nav-back{font-family:'Syne',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);text-decoration:none;cursor:none;transition:color .2s;display:flex;align-items:center;gap:.5rem;}
.lovr-nav-back:hover{color:var(--white);}
.lovr-nav-back::before{content:'←';transition:transform .2s;}
.lovr-nav-back:hover::before{transform:translateX(-3px);}

/* hero */
.page-hero{
  padding:10rem 3rem 5rem;
  max-width:860px;
  margin:0 auto;
  opacity:0;
  animation:lovrFadeUp .9s .2s ease forwards;
}
.page-tag{font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:var(--primary);margin-bottom:1.2rem;}
.page-title{font-family:'DM Serif Display',serif;font-size:clamp(2.8rem,6vw,5rem);line-height:1.06;color:var(--white);margin-bottom:1rem;}
.page-title em{font-style:italic;background:linear-gradient(130deg,var(--red),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.page-sub{font-size:1rem;font-weight:300;color:var(--white-dim);line-height:1.8;max-width:500px;}

/* ── EMAIL HERO BLOCK ── */
.email-hero{
  max-width:860px;
  margin:0 auto;
  padding:3rem 3rem 0;
  opacity:0;
  transform:translateY(20px);
  transition:opacity .8s ease,transform .8s ease;
}
.email-hero.visible{opacity:1;transform:translateY(0);}
.email-address-wrap{
  display:inline-flex;
  align-items:center;
  gap:1rem;
  border:1px solid var(--border2);
  border-radius:12px;
  padding:1.2rem 1.8rem;
  background:rgba(89,95,177,.04);
  transition:border-color .3s,background .3s,box-shadow .3s;
  text-decoration:none;
  cursor:none;
  margin-bottom:1rem;
}
.email-address-wrap:hover{
  border-color:var(--primary-mid);
  background:rgba(89,95,177,.08);
  box-shadow:0 0 40px var(--primary-dim);
}
.email-icon{
  width:38px;height:38px;border-radius:8px;
  background:var(--primary-dim);border:1px solid rgba(89,95,177,.2);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.email-text{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.1rem,2.5vw,1.55rem);
  color:var(--white);
  letter-spacing:.02em;
}
.email-copy-hint{
  font-family:'Syne',sans-serif;
  font-size:.68rem;
  font-weight:600;
  letter-spacing:.15em;
  text-transform:uppercase;
  color:var(--gray);
  margin-top:.6rem;
  display:flex;
  align-items:center;
  gap:.4rem;
}
.email-copy-hint::before{content:'↑';}

/* ── CARDS ── */
.contact-cards{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:1.5px;
  background:var(--border);
  border:1px solid var(--border);
  border-radius:16px;
  overflow:hidden;
  max-width:860px;
  margin:3.5rem auto 0;
  opacity:0;
  transform:translateY(20px);
  transition:opacity .8s .1s ease,transform .8s .1s ease;
}
.contact-cards.visible{opacity:1;transform:translateY(0);}

.contact-card{
  background:var(--bg2);
  padding:2.2rem;
  position:relative;
  overflow:hidden;
  transition:background .3s;
}
.contact-card::before{
  content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--primary),var(--purple));
  transform:scaleX(0);transform-origin:left;
  transition:transform .4s ease;
}
.contact-card:hover{background:#131418;}
.contact-card:hover::before{transform:scaleX(1);}

.card-icon{
  width:36px;height:36px;border-radius:8px;
  background:var(--primary-dim);border:1px solid rgba(89,95,177,.2);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:1.2rem;
}
.card-title{
  font-family:'Syne',sans-serif;font-size:.92rem;font-weight:700;
  color:var(--white);margin-bottom:.5rem;letter-spacing:.02em;
}
.card-body{
  font-size:.87rem;font-weight:300;color:var(--white-dim);line-height:1.7;
}
.card-link{
  display:inline-flex;align-items:center;gap:.4rem;
  font-family:'Syne',sans-serif;font-size:.75rem;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;
  color:var(--primary);text-decoration:none;
  margin-top:.9rem;cursor:none;transition:gap .2s;
}
.card-link:hover{gap:.7rem;}
.card-link::after{content:'→';}

/* divider */
.page-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:6rem 3rem 0;}

/* footer */
.lovr-footer{padding:2.5rem 3rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.lovr-footer-logo{font-family:'DM Serif Display',serif;font-size:1.1rem;background:linear-gradient(130deg,var(--red),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.lovr-footer-links{display:flex;gap:2rem;list-style:none;}
.lovr-footer-links a{font-family:'Syne',sans-serif;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);text-decoration:none;cursor:none;transition:color .2s;}
.lovr-footer-links a:hover{color:var(--white);}
.lovr-footer-note{font-size:.75rem;color:var(--gray);}

@keyframes lovrFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:900px){
  .lovr-nav{padding:1.2rem 1.5rem;}
  .page-hero,.email-hero{padding-left:1.5rem;padding-right:1.5rem;}
  .contact-cards{grid-template-columns:1fr;margin-left:1.5rem;margin-right:1.5rem;}
  .page-divider{margin-left:1.5rem;margin-right:1.5rem;}
  .lovr-footer{flex-direction:column;gap:1rem;text-align:center;}
  .lovr-footer-links{flex-wrap:wrap;justify-content:center;}
}
`;

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function ContactPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);

  /* cursor */
  useEffect(() => {
    const cur = cursorRef.current; const ring = ringRef.current;
    if (!cur || !ring) return;
    let mx=0,my=0,rx=0,ry=0; let raf:number;
    const onMove=(e:MouseEvent)=>{mx=e.clientX;my=e.clientY;};
    document.addEventListener('mousemove',onMove);
    const loop=()=>{rx+=(mx-rx)*.12;ry+=(my-ry)*.12;cur.style.left=mx-5+'px';cur.style.top=my-5+'px';ring.style.left=rx-18+'px';ring.style.top=ry-18+'px';raf=requestAnimationFrame(loop);};
    raf=requestAnimationFrame(loop);
    const grow=()=>{cur.style.transform='scale(2.4)';ring.style.width=ring.style.height='56px';ring.style.borderColor='#8448ac99';};
    const shrink=()=>{cur.style.transform='scale(1)';ring.style.width=ring.style.height='36px';ring.style.borderColor='';};
    document.querySelectorAll('a,button').forEach(el=>{el.addEventListener('mouseenter',grow);el.addEventListener('mouseleave',shrink);});
    return ()=>{cancelAnimationFrame(raf);document.removeEventListener('mousemove',onMove);};
  }, []);

  /* canvas */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W=0,H=0; let particles:Particle[]=[]; let orbT=0; let raf:number;
    const resize=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;particles=Array.from({length:80},()=>new Particle(W,H));};
    resize(); window.addEventListener('resize',resize);
    const loop=()=>{
      ctx.clearRect(0,0,W,H); orbT+=.002;
      const g1=ctx.createRadialGradient(W*.65,H*.3,0,W*.65,H*.3,350);
      g1.addColorStop(0,'rgba(89,95,177,0.07)');g1.addColorStop(1,'transparent');
      ctx.fillStyle=g1;ctx.beginPath();ctx.arc(W*.65,H*.3,350,0,Math.PI*2);ctx.fill();
      const g2=ctx.createRadialGradient(W*.25,H*.75,0,W*.25,H*.75,260);
      g2.addColorStop(0,'rgba(235,111,111,0.05)');g2.addColorStop(1,'transparent');
      ctx.fillStyle=g2;ctx.beginPath();ctx.arc(W*.25,H*.75,260,0,Math.PI*2);ctx.fill();
      particles.forEach(p=>{p.update();p.draw(ctx);});
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll('.email-hero,.contact-cards');
    const obs = new IntersectionObserver(
      entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),
      {threshold:.08}
    );
    els.forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, []);

  return (
    <div className="lovr-root">
      <style>{CSS}</style>
      <canvas ref={canvasRef} className="lovr-canvas" />
      <div className="lovr-noise" />
      <div ref={cursorRef} className="lovr-cursor" />
      <div ref={ringRef}   className="lovr-cursor-ring" />

      <div className="lovr-wrapper">

        <nav className="lovr-nav">
          <Link href="/" className="lovr-nav-logo">LOVR</Link>
          <Link href="/" className="lovr-nav-back">Volver al inicio</Link>
        </nav>

        <div className="page-hero">
          <div className="page-tag">Contacto</div>
          <h1 className="page-title">Hablemos <em>directamente</em></h1>
          <p className="page-sub">
            Sin formularios, sin tickets, sin espera innecesaria. Escríbenos cuando sea necesario.
          </p> <br />
          <p className="page-sub">
            ¿Te apasiona la programación o el diseño? ¡LOVR sigue en constante y desarrollo y nos encantaría conocerte!
          </p>
        </div>

        <div className="email-hero">
          <a href="mailto:artssc925@gmail.com" className="email-address-wrap">
            <div className="email-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#595fb1" strokeWidth="1.5">
                <rect x="1" y="3" width="16" height="12" rx="2"/>
                <path d="M1 6l8 5 8-5"/>
              </svg>
            </div>
            <span className="email-text">artssc925@gmail.com</span>
          </a>
        </div>

        <div className="contact-cards">

          <div className="contact-card">
            <div className="card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#595fb1" strokeWidth="1.5">
                <circle cx="9" cy="9" r="7"/>
                <path d="M9 5v4l2.5 2.5"/>
              </svg>
            </div>
            <div className="card-title">Respuesta rápida</div>
            <p className="card-body">
              Respondemos todos los mensajes en menos de 24 horas. Si es urgente, indícalo en el asunto y lo priorizamos.
            </p>
          </div>

          <div className="contact-card">
            <div className="card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#595fb1" strokeWidth="1.5">
                <rect x="2" y="5" width="14" height="10" rx="2"/>
                <path d="M6 5V4a2 2 0 0 1 4 0v1"/>
                <path d="M9 10v2M8 11h2"/>
              </svg>
            </div>
            <div className="card-title">Trabaja con nosotros</div>
            <p className="card-body">
              ¿Quieres ser parte del equipo? Cuéntanos en qué área destacas y qué te emociona de LOVR.
            </p>
            <a href="mailto:artssc925@gmail.com?subject=Quiero%20trabajar%20en%20LOVR" className="card-link">
              Escríbenos
            </a>
          </div>

          <div className="contact-card">
            <div className="card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#595fb1" strokeWidth="1.5">
                <path d="M3 9l4 4 8-8"/>
                <path d="M1 5l3-3 3 3M14 10l3 3-3 3"/>
              </svg>
            </div>
            <div className="card-title">Promociones y colaboraciones</div>
            <p className="card-body">
              Abiertos a alianzas, integraciones y proyectos conjuntos. Si tienes una idea, queremos escucharla.
            </p>
            <a href="mailto:artssc925@gmail.com?subject=Propuesta%20de%20colaboraci%C3%B3n" className="card-link">
              Proponer algo
            </a>
          </div>

        </div>

        <div className="page-divider" />

        <footer className="lovr-footer">
          <div className="lovr-footer-logo">LOVR</div>
          <ul className="lovr-footer-links">
            <li><Link href="/privacy">Privacidad</Link></li>
            <li><Link href="/terms">Términos</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
          </ul>
          <div className="lovr-footer-note">© 2026 LOVR · All rights reserved.</div>
        </footer>

      </div>
    </div>
  );
}