'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────
   Particle (canvas) — same as landing
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
   CSS — same tokens, terms-specific layout
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

/* page hero */
.page-hero{padding:10rem 3rem 5rem;max-width:860px;margin:0 auto;border-bottom:1px solid var(--border);opacity:0;animation:lovrFadeUp .9s .2s ease forwards;}
.page-tag{font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:var(--primary);margin-bottom:1.2rem;}
.page-title{font-family:'DM Serif Display',serif;font-size:clamp(2.8rem,6vw,5rem);line-height:1.06;color:var(--white);margin-bottom:1.2rem;}
.page-title em{font-style:italic;background:linear-gradient(130deg,var(--red),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.page-meta{font-size:.82rem;color:var(--gray);letter-spacing:.04em;}

/* two-column layout with sticky TOC */
.terms-layout{display:grid;grid-template-columns:220px 1fr;gap:5rem;max-width:1060px;margin:0 auto;padding:4rem 3rem 8rem;align-items:start;}
.terms-toc{position:sticky;top:7rem;}
.toc-label{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gray);margin-bottom:1.2rem;}
.toc-list{list-style:none;display:flex;flex-direction:column;gap:.2rem;}
.toc-list a{font-family:'Syne',sans-serif;font-size:.78rem;font-weight:500;color:var(--gray);text-decoration:none;padding:.45rem .8rem;border-radius:6px;cursor:none;transition:color .2s,background .2s;display:block;}
.toc-list a:hover,.toc-list a.active{color:var(--white);background:rgba(89,95,177,.08);}
.toc-list a.active{border-left:2px solid var(--primary);padding-left:.6rem;}

/* sections */
.terms-sections{display:flex;flex-direction:column;gap:3.5rem;}
.page-section{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease;scroll-margin-top:7rem;}
.page-section.visible{opacity:1;transform:translateY(0);}
.page-section h2{font-family:'DM Serif Display',serif;font-size:1.55rem;font-weight:400;color:var(--white);margin-bottom:1rem;display:flex;align-items:center;gap:.8rem;}
.page-section h2::before{content:'';display:block;width:20px;height:1px;background:linear-gradient(90deg,var(--red),var(--purple));flex-shrink:0;}
.page-section p{font-size:.95rem;font-weight:300;color:var(--white-dim);line-height:1.85;margin-bottom:.9rem;}
.page-section p:last-child{margin-bottom:0;}
.page-section ul{list-style:none;margin-top:.4rem;}
.page-section ul li{font-size:.93rem;font-weight:300;color:var(--white-dim);line-height:1.8;padding:.3rem 0 .3rem 1.4rem;position:relative;}
.page-section ul li::before{content:'·';position:absolute;left:0;color:var(--primary);font-size:1.1rem;line-height:1.6;}
.page-highlight{background:rgba(89,95,177,.05);border:1px solid var(--border);border-left:2px solid var(--primary);padding:1.2rem 1.6rem;border-radius:0 8px 8px 0;margin:1.2rem 0;}
.page-highlight p{color:var(--white-dim);font-size:.9rem;margin:0;}
.page-warn{background:rgba(235,111,111,.05);border:1px solid rgba(235,111,111,.12);border-left:2px solid var(--red);padding:1.2rem 1.6rem;border-radius:0 8px 8px 0;margin:1.2rem 0;}
.page-warn p{color:var(--white-dim);font-size:.9rem;margin:0;}

/* section divider */
.page-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:0 3rem;}

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
  .terms-layout{grid-template-columns:1fr;gap:2rem;padding-left:1.5rem;padding-right:1.5rem;}
  .terms-toc{display:none;}
  .lovr-footer{flex-direction:column;gap:1rem;text-align:center;}
  .lovr-footer-links{flex-wrap:wrap;justify-content:center;}
}
`;

/* ─────────────────────────────────────────
   TOC data
───────────────────────────────────────── */
const TOC = [
  { id: 'uso',          label: 'Uso del servicio' },
  { id: 'cuenta',       label: 'Tu cuenta' },
  { id: 'contenido',    label: 'Tu contenido' },
  { id: 'prohibido',    label: 'Usos prohibidos' },
  { id: 'propiedad',    label: 'Propiedad intelectual' },
  { id: 'limitaciones', label: 'Limitaciones' },
  { id: 'terminacion',  label: 'Terminación' },
  { id: 'cambios',      label: 'Cambios al servicio' },
];

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function TermsPage() {
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
    const loop=()=>{ctx.clearRect(0,0,W,H);orbT+=.002;
      const g=ctx.createRadialGradient(W*.5,H*.15,0,W*.5,H*.15,380);g.addColorStop(0,'rgba(132,72,172,0.06)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*.5,H*.15,380,0,Math.PI*2);ctx.fill();
      particles.forEach(p=>{p.update();p.draw(ctx);});raf=requestAnimationFrame(loop);};
    raf=requestAnimationFrame(loop);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  }, []);

  /* scroll reveal + active TOC */
  useEffect(() => {
    const els = document.querySelectorAll('.page-section');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          const id = e.target.getAttribute('id');
          document.querySelectorAll('.toc-list a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lovr-root">
      <style>{CSS}</style>
      <canvas ref={canvasRef} className="lovr-canvas" />
      <div className="lovr-noise" />
      <div ref={cursorRef} className="lovr-cursor" />
      <div ref={ringRef}   className="lovr-cursor-ring" />

      <div className="lovr-wrapper">

        {/* NAV */}
        <nav className="lovr-nav">
          <Link href="/" className="lovr-nav-logo">LOVR</Link>
          <Link href="/" className="lovr-nav-back">Volver al inicio</Link>
        </nav>

        {/* PAGE HERO */}
        <div className="page-hero">
          <div className="page-tag">Legal</div>
          <h1 className="page-title">Términos de <em>servicio</em></h1>
          <p className="page-meta">Última actualización: 28 de marzo de 2026 <br />
          <b>Versión</b> 1.2</p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="terms-layout">

          {/* Sticky TOC */}
          <aside className="terms-toc">
            <div className="toc-label">En esta página</div>
            <ul className="toc-list">
              {TOC.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Sections */}
          <div className="terms-sections">

            <div id="uso" className="page-section">
              <h2>Uso del servicio</h2>
              <p>Al acceder y usar LOVR, aceptas cumplir estos términos. Si no estás de acuerdo con alguna parte, te pedimos que no uses el servicio.</p>
              <p>LOVR es una plataforma de asistencia inteligente diseñada para ayudarte a organizar tareas, generar documentos y exportar resultados en tu propio estilo. El servicio está dirigido a personas mayores de 13 años.</p>
              <div className="page-highlight">
                <p>Estos términos constituyen un acuerdo legal entre tú y LOVR. Léelos con atención antes de continuar.</p>
              </div>
            </div>

            <div id="cuenta" className="page-section">
              <h2>Tu cuenta</h2>
              <p>Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad que ocurra bajo tu cuenta. Notifícanos de inmediato ante cualquier acceso no autorizado.</p>
              <p>Debes proporcionar información precisa al registrarte y mantenerla actualizada. No puedes crear cuentas de forma automatizada ni en nombre de otros sin su consentimiento explícito.</p>
            </div>

            <div id="contenido" className="page-section">
              <h2>Tu contenido</h2>
              <p>Conservas todos los derechos sobre el contenido que introduces en LOVR — tus textos, archivos y datos son tuyos. Al usar el servicio, nos otorgas una licencia limitada para procesar ese contenido con el único fin de generar los resultados que solicitas.</p>
              <p>No reclamamos propiedad sobre nada de lo que produces usando LOVR. Los documentos y resultados generados son tuyos para usar como desees.</p>
            </div>

            <div id="prohibido" className="page-section">
              <h2>Usos prohibidos</h2>
              <p>Al usar LOVR te comprometes a no:</p>
              <ul>
                <li>Usar el servicio para generar contenido ilegal, engañoso, difamatorio o que viole derechos de terceros.</li>
                <li>Intentar acceder a sistemas o datos de otros usuarios sin autorización.</li>
                <li>Usar LOVR para automatizar spam, phishing u otras prácticas abusivas.</li>
                <li>Revender, redistribuir o sublicenciar el acceso al servicio sin autorización escrita.</li>
                <li>Realizar ingeniería inversa, descompilar o intentar extraer el código fuente de la plataforma.</li>
              </ul>
              <div className="page-warn">
                <p>La violación de estos términos puede resultar en la suspensión inmediata de tu cuenta.</p>
              </div>
            </div>

            <div id="propiedad" className="page-section">
              <h2>Propiedad intelectual</h2>
              <p>LOVR y todos sus componentes — incluyendo el diseño, la marca, el código y la tecnología subyacente — son propiedad exclusiva de LOVR o sus licenciantes. Están protegidos por leyes de propiedad intelectual aplicables.</p>
              <p>No se te concede ningún derecho sobre la marca LOVR ni sobre ningún elemento de la plataforma más allá del uso limitado descrito en estos términos.</p>
            </div>

            <div id="limitaciones" className="page-section">
              <h2>Limitaciones de responsabilidad</h2>
              <p>LOVR se proporciona "tal cual". No garantizamos que el servicio esté disponible de forma ininterrumpida, libre de errores o completamente adecuado para todos los usos.</p>
              <p>En ningún caso LOVR será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio. Nuestra responsabilidad total está limitada al monto que hayas pagado en los últimos 12 meses.</p>
            </div>

            <div id="terminacion" className="page-section">
              <h2>Terminación</h2>
              <p>Puedes dejar de usar LOVR en cualquier momento eliminando tu cuenta desde la configuración. Tras la eliminación, tus datos serán borrados en un plazo de 30 días.</p>
              <p>LOVR puede suspender o terminar tu acceso si violas estos términos, si detectamos actividad fraudulenta o si el servicio es descontinuado. En caso de descontinuación, te notificaremos con al menos 60 días de anticipación.</p>
            </div>

            <div id="cambios" className="page-section">
              <h2>Cambios al servicio</h2>
              <p>Nos reservamos el derecho de modificar, pausar o discontinuar cualquier aspecto del servicio. Para cambios significativos, te notificaremos con al menos 15 días de anticipación.</p>
              <p>El uso continuado de LOVR después de la entrada en vigencia de cambios a estos términos constituye tu aceptación de los mismos. Si no estás de acuerdo con los cambios, puedes cancelar tu cuenta antes de la fecha de vigencia.</p>
              </div>

          </div>
        </div>

        <div className="page-divider" />

        {/* FOOTER */}
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