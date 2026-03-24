'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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

/* page hero */
.page-hero{padding:10rem 3rem 5rem;max-width:860px;margin:0 auto;border-bottom:1px solid var(--border);opacity:0;animation:lovrFadeUp .9s .2s ease forwards;}
.page-tag{font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:var(--primary);margin-bottom:1.2rem;}
.page-title{font-family:'DM Serif Display',serif;font-size:clamp(2.8rem,6vw,5rem);line-height:1.06;color:var(--white);margin-bottom:1.2rem;}
.page-title em{font-style:italic;background:linear-gradient(130deg,var(--red),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.page-meta{font-size:.82rem;color:var(--gray);letter-spacing:.04em;}

/* content */
.page-content{max-width:860px;margin:0 auto;padding:4rem 3rem 8rem;}
.page-section{margin-bottom:3.5rem;opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease;}
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

/* divider */
.page-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:0 3rem;}

/* footer */
.lovr-footer{padding:2.5rem 3rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.lovr-footer-logo{font-family:'DM Serif Display',serif;font-size:1.1rem;background:linear-gradient(130deg,var(--red),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.lovr-footer-links{display:flex;gap:2rem;list-style:none;}
.lovr-footer-links a{font-family:'Syne',sans-serif;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);text-decoration:none;cursor:none;transition:color .2s;}
.lovr-footer-links a:hover{color:var(--white);}
.lovr-footer-note{font-size:.75rem;color:var(--gray);}

@keyframes lovrFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.lovr-nav{padding:1.2rem 1.5rem;}.page-hero,.page-content{padding-left:1.5rem;padding-right:1.5rem;}.lovr-footer{flex-direction:column;gap:1rem;text-align:center;}.lovr-footer-links{flex-wrap:wrap;justify-content:center;}}
`;

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function PrivacyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const [scrolled] = useState(true); // nav always solid on inner pages

  /* cursor */
  useEffect(() => {
    const cur = cursorRef.current; const ring = ringRef.current;
    if (!cur || !ring) return;
    let mx=0,my=0,rx=0,ry=0; let raf:number;
    const onMove = (e:MouseEvent) => { mx=e.clientX; my=e.clientY; };
    document.addEventListener('mousemove', onMove);
    const loop = () => { rx+=(mx-rx)*.12; ry+=(my-ry)*.12; cur.style.left=mx-5+'px'; cur.style.top=my-5+'px'; ring.style.left=rx-18+'px'; ring.style.top=ry-18+'px'; raf=requestAnimationFrame(loop); };
    raf=requestAnimationFrame(loop);
    const grow=()=>{cur.style.transform='scale(2.4)';ring.style.width=ring.style.height='56px';ring.style.borderColor='#8448ac99';};
    const shrink=()=>{cur.style.transform='scale(1)';ring.style.width=ring.style.height='36px';ring.style.borderColor='';};
    document.querySelectorAll('a,button').forEach(el=>{el.addEventListener('mouseenter',grow);el.addEventListener('mouseleave',shrink);});
    return () => { cancelAnimationFrame(raf); document.removeEventListener('mousemove', onMove); };
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
      const g=ctx.createRadialGradient(W*.5,H*.2,0,W*.5,H*.2,400);
      g.addColorStop(0,'rgba(89,95,177,0.07)');g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*.5,H*.2,400,0,Math.PI*2);ctx.fill();
      particles.forEach(p=>{p.update();p.draw(ctx);});
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll('.page-section');
    const obs = new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:.1});
    els.forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, []);

  const sections = [
    {
      title: 'Qué información recopilamos',
      content: (
        <>
          <p>Recopilamos únicamente la información necesaria para que LOVR funcione correctamente y te ofrezca resultados personalizados. Esto incluye:</p>
          <ul>
            <li>Información de cuenta: nombre, correo electrónico y contraseña cifrada.</li>
            <li>Contenido que introduces: tareas, textos y archivos que compartes para generar resultados.</li>
            <li>Datos de uso: páginas visitadas, acciones dentro de la plataforma y preferencias de configuración.</li>
            <li>Información técnica: tipo de dispositivo, navegador y dirección IP para seguridad y soporte.</li>
          </ul>
          <div className="page-highlight">
            <p>Nunca vendemos tu información personal a terceros. Nunca.</p>
          </div>
        </>
      ),
    },
    {
      title: 'Cómo usamos tu información',
      content: (
        <>
          <p>Toda la información que recopilamos tiene un propósito específico y limitado:</p>
          <ul>
            <li>Personalizar los resultados de LOVR con tu estilo de escritura y preferencias.</li>
            <li>Mejorar la precisión del agente a lo largo del tiempo mediante patrones de uso.</li>
            <li>Enviarte comunicaciones relevantes sobre tu cuenta, cambios en el servicio o novedades que hayas solicitado.</li>
            <li>Garantizar la seguridad de tu cuenta y detectar actividad inusual.</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Almacenamiento y seguridad',
      content: (
        <>
          <p>Tu información se almacena en servidores seguros con cifrado en reposo y en tránsito. Utilizamos protocolos estándar de la industria (TLS 1.3, AES-256) para proteger todos los datos.</p>
          <p>El acceso a tu información está restringido a los sistemas automatizados de LOVR y, en casos excepcionales de soporte técnico, a personal autorizado bajo estrictos protocolos de confidencialidad.</p>
          <p>Conservamos tus datos mientras tu cuenta esté activa. Si decides eliminar tu cuenta, tus datos se borran de nuestros sistemas en un plazo máximo de 30 días.</p>
        </>
      ),
    },
    {
      title: 'Cookies y tecnologías similares',
      content: (
        <>
          <p>Usamos cookies esenciales para mantener tu sesión activa y cookies de rendimiento para entender cómo se usa la plataforma. No utilizamos cookies de publicidad ni rastreo de terceros.</p>
          <p>Puedes controlar las cookies desde la configuración de tu navegador. Desactivar las cookies esenciales puede afectar el funcionamiento de la plataforma.</p>
        </>
      ),
    },
    {
      title: 'Tus derechos',
      content: (
        <>
          <p>Tienes control total sobre tu información. En cualquier momento puedes:</p>
          <ul>
            <li>Acceder a todos los datos que tenemos sobre ti desde tu perfil.</li>
            <li>Solicitar la corrección de información incorrecta o desactualizada.</li>
            <li>Pedir la eliminación completa de tu cuenta y datos asociados.</li>
            <li>Exportar tu información en formato portable (JSON o CSV).</li>
            <li>Revocar permisos de acceso a integraciones externas en cualquier momento.</li>
          </ul>
          
        </>
      ),
    },
    {
      title: 'Cambios a esta política',
      content: (
        <p>Cuando realicemos cambios significativos a esta política, te notificaremos por correo electrónico con al menos 15 días de anticipación. Los cambios menores serán reflejados en esta página con la fecha de última actualización visible en el encabezado.</p>
      ),
    },
  ];

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
          <h1 className="page-title">Política de <em>privacidad</em></h1>
          <p className="page-meta">Última actualización: 19 de marzo de 2026 &nbsp;·&nbsp; Versión 1.0</p>
        </div>

        {/* CONTENT */}
        <div className="page-content">
          {sections.map((s, i) => (
            <div key={i} className="page-section" style={{ transitionDelay: `${i * 60}ms` }}>
              <h2>{s.title}</h2>
              {s.content}
              {i < sections.length - 1 && <div style={{ height: '2.5rem' }} />}
            </div>
          ))}
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