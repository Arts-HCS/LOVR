'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import "./landing.css"
import Image from 'next/image';


/* ─────────────────────────────────────────
   Particle class (canvas)
───────────────────────────────────────── */
const COLORS = ['#595fb1', '#8448ac', '#eb6f6f', '#827989'];

class Particle {
  x = 0; y = 0; size = 1;
  speedX = 0; speedY = 0;
  color = '#595fb1'; alpha = 0.2;
  life = 150; age = 0;
  W: number; H: number;

  constructor(W: number, H: number) {
    this.W = W; this.H = H;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.W;
    this.y = Math.random() * this.H;
    this.size = Math.random() * 1.8 + 0.4;
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.speedY = (Math.random() - 0.5) * 0.2;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.45 + 0.1;
    this.life = Math.random() * 200 + 100;
    this.age = 0;
  }
  update() {
    this.x += this.speedX; this.y += this.speedY; this.age++;
    if (this.age > this.life || this.x < 0 || this.x > this.W || this.y < 0 || this.y > this.H)
      this.reset();
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha * (1 - this.age / this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const STRIP_ITEMS = [
  'Lenguaje natural', 'Sin prompts', 'Documentos listos',
  'Replica tu estilo', 'Presentaciones', 'Formato académico',
  'Sin estructura', 'Exporta al instante',
  'Lenguaje natural', 'Sin prompts', 'Documentos listos',
  'Replica tu estilo', 'Presentaciones', 'Formato académico',
  'Sin estructura', 'Exporta al instante',
];

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function LovrLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const [inputVal,  setInputVal]  = useState('');
  const [scrolled,  setScrolled]  = useState(false);

  /* ── Scroll nav ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Custom cursor ── */
  useEffect(() => {
    const cur  = cursorRef.current;
    const ring = ringRef.current;
    if (!cur || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);

    const loop = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      cur.style.left  = mx - 5  + 'px'; cur.style.top  = my - 5  + 'px';
      ring.style.left = rx - 18 + 'px'; ring.style.top = ry - 18 + 'px';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const grow   = () => { cur.style.transform = 'scale(2.4)'; ring.style.width = ring.style.height = '60px'; ring.style.borderColor = '#8448ac99'; };
    const shrink = () => { cur.style.transform = 'scale(1)';   ring.style.width = ring.style.height = '36px'; ring.style.borderColor = ''; };

    document.querySelectorAll('a, button, input, .lovr-step, .lovr-feature-card').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });

    return () => { cancelAnimationFrame(raf); document.removeEventListener('mousemove', onMove); };
  }, []);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0;
    let particles: Particle[] = [];
    let orbT = 0;
    let raf: number;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      particles = Array.from({ length: 130 }, () => new Particle(W, H));
    };
    resize();
    window.addEventListener('resize', resize);

    const drawOrbs = () => {
      orbT += 0.0025;
      const cx1 = W * 0.28 + Math.sin(orbT) * W * 0.11;
      const cy1 = H * 0.55 + Math.cos(orbT * 0.7) * H * 0.1;
      const g1  = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 340);
      g1.addColorStop(0, 'rgba(89,95,177,0.13)'); g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(cx1, cy1, 340, 0, Math.PI * 2); ctx.fill();

      const cx2 = W * 0.74 + Math.cos(orbT * 0.85) * W * 0.1;
      const cy2 = H * 0.32 + Math.sin(orbT * 1.15) * H * 0.1;
      const g2  = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 280);
      g2.addColorStop(0, 'rgba(132,72,172,0.11)'); g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx2, cy2, 280, 0, Math.PI * 2); ctx.fill();

      const cx3 = W * 0.5 + Math.sin(orbT * 0.6) * W * 0.08;
      const cy3 = H * 0.8 + Math.cos(orbT * 0.9) * H * 0.08;
      const g3  = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, 200);
      g3.addColorStop(0, 'rgba(235,111,111,0.06)'); g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3; ctx.beginPath(); ctx.arc(cx3, cy3, 200, 0, Math.PI * 2); ctx.fill();
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      drawOrbs();
      particles.forEach(p => { p.update(); p.draw(ctx); });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.lovr-reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lovr-root">
      <canvas ref={canvasRef} className="lovr-canvas" />
      <div className="lovr-noise" />
      <div ref={cursorRef} className="lovr-cursor" />
      <div ref={ringRef}   className="lovr-cursor-ring" />

      <div className="lovr-wrapper">

        <nav className={`lovr-nav${scrolled ? ' scrolled' : ''}`}>
          <div className="lovr-nav-logo">
            LOVR
          </div>
          <input type="checkbox" id='sidebar-active' />
          <label id="overlay" htmlFor="sidebar-active"></label>

          <ul className="lovr-footer-links">
            <label htmlFor='sidebar-active' className='lovr-nav-close'>
              <i className="fa-solid fa-xmark lovr-nav-toggle-icon"></i>
            </label>
            <li><Link href={"/privacy"}>Privacidad</Link></li>
            <li><Link href={"/terms"}>Términos</Link></li>
            <li><Link href={"/contacto"}>Contacto</Link></li>
            <Link href="/register" className="lovr-nav-cta inside">Comenzar</Link>
          </ul>
          <Link href="/register" className="lovr-nav-cta">Comenzar</Link>
          <label htmlFor="sidebar-active" className='lovr-nav-open'>
            <i className="fa-solid fa-bars lovr-nav-toggle-icon"></i>
          </label>
        </nav>

        <section className="lovr-hero">
          <div className="lovr-hero-grid" />
          <h1 className="lovr-hero-title">
            El nuevo<br /><em>estándar</em>
          </h1>
          <p className="lovr-hero-sub">
            Un agente de IA que te entiende sin prompts. 
            Organiza tus tareas automáticamente y crea resultados
            con tu estilo de escritura.
          </p>
          <div className="lovr-input-wrap" id="start">
            <input
              ref={inputRef}
              className="lovr-input"
              type="text"
              placeholder="acabar la cosa de física para el martes..."
              maxLength={120}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <a href='#como' className="lovr-send">Listo →</a>
          </div>
          <p className="lovr-hero-hint">
            Escribe lo que sea, como sea... <br /> <span>Lo de español </span> <span>El reporte este de física</span> <br /> <span>La presentación de miss Dani</span> 
          </p>
          <div className="lovr-scroll-hint">
            <div className="lovr-scroll-line" />
          </div>
        </section>

        <div className="lovr-strip">
          <div className="lovr-strip-inner">
            {STRIP_ITEMS.map((item, i) => (
              <div key={i} className="lovr-strip-item">
                <div className="lovr-strip-dot" />{item}
              </div>
            ))}
          </div>
        </div>

        <section className="lovr-section lovr-reveal" id="como">
          <div className="lovr-section-label">Cómo funciona</div>
          <h2 className="lovr-section-title">Un proceso<br /><em>Lógico y rápido</em></h2>
          <div className="lovr-steps">
            {[
              {
                n: '01',
                title: 'Anota tus pendientes',
                body: 'Escribe tus pendientes como si estuvieras platicando, ¡sin formato! Menciona su hora y día de entrega. Cualquier forma de escribir es correcta.',
              },
              {
                n: '02',
                title: 'Ahorra tiempo',
                body: 'Escribir prompts lleva tiempo... mejor sólo copia y pega toda la información que necesitarías para hacer la tarea. No expliques qué hacer, LOVR lo entenderá.',
              },
              {
                n: '03',
                title: 'Trabaja con tus resultados',
                body: 'Exporta a Google Docs con formato APA o MLA, o a una presentación en Google Slides. También puedes ver tu versión LOVR: el trabajo generado con tu estilo de escritura.',
              },
            ].map(s => (
              <div key={s.n} className="lovr-step">
                <div className="lovr-step-num">{s.n}</div>
                <div className="lovr-step-title">{s.title}</div>
                <p className="lovr-step-body">{s.body}</p>
                <div className="lovr-step-accent" />
              </div>
            ))}
          </div>
        </section>
        
        <section className="s-hero">
          <div className="s-hero-grid" />
          <h1 className="s-hero-title">
            Desarrollado <br /> por y para<br />
            <em>estudiantes</em>
          </h1>
          <p className="s-hero-sub">
            Lidiar con el estrés escolar, recordar pendientes y tener que trabajar en cada tarea, una a la vez, es cosa del pasado...
          </p>
        </section>

        <section className="lovr-statement lovr-reveal">
          <div className="lovr-statement-bg" />
          <div className="lovr-statement-bg2" />
          <h2 className="lovr-statement-title">
            <em>Tú.</em><br />Como<br />Nunca Antes
          </h2>
          <p className="lovr-statement-sub">
            Las herramientas actuales te obligan a adaptarte, recordar y corregir:
            ellas son el centro. Con LOVR, el centro eres tú.
          </p>
          <Link href="/register" className="lovr-cta-btn">
            Comienza a enamorarte
          </Link>
        </section>

        <footer className="lovr-footer">
          <div className="lovr-footer-logo">
            <Image src="/lovr.png" alt="Logo" width={70} height={70} className="lovr-nav-logo-img"></Image>
          </div>
          <ul className="lovr-rfooter-links">
            <li><Link href={"/privacy"}>Privacidad</Link></li>
            <li><Link href={"/terms"}>Términos</Link></li>
            <li><Link href={"/contacto"}>Contacto</Link></li>
          </ul>
          <div className="lovr-footer-note">© 2026 LOVR · All rights reserved.</div>
        </footer>

      </div>
    </div>
  );
}