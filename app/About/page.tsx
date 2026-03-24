'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────
   CSS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #0c0c0f;
  --bg2:         #111116;
  --bg3:         #18181f;
  --border:      rgba(255,255,255,0.08);
  --border2:     rgba(255,255,255,0.12);
  --rose:        #c9607a;
  --rose-bright: #e07090;
  --purple:      #8448ac;
  --white:       #f0edf2;
  --white-dim:   rgba(240,237,242,0.6);
  --gray:        rgba(240,237,242,0.36);
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg); color: var(--white);
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden; cursor: none;
  -webkit-font-smoothing: antialiased;
}
::selection { background: rgba(201,96,122,0.28); color: var(--white); }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* ── CURSOR ── */
.s-cursor {
  position: fixed; width: 10px; height: 10px;
  background: var(--white); border-radius: 50%;
  pointer-events: none; z-index: 9999;
  transition: transform .15s ease;
  mix-blend-mode: difference;
}
.s-cursor-ring {
  position: fixed; width: 34px; height: 34px;
  border: 1px solid rgba(201,96,122,0.45);
  border-radius: 50%; pointer-events: none; z-index: 9998;
  transition: width .25s, height .25s, border-color .25s;
}

/* ── ORBS ── */
.s-orb {
  position: fixed; border-radius: 50%;
  pointer-events: none; filter: blur(80px); z-index: 0;
}
.s-orb-1 {
  width: 700px; height: 480px;
  background: radial-gradient(ellipse, rgba(180,80,110,.24) 0%, transparent 70%);
  bottom: -80px; left: 50%; transform: translateX(-50%);
  animation: orbA 10s ease-in-out infinite;
}
.s-orb-2 {
  width: 380px; height: 380px;
  background: radial-gradient(ellipse, rgba(132,72,172,.16) 0%, transparent 70%);
  top: 15%; right: -60px;
  animation: orbB 13s ease-in-out infinite;
}
.s-orb-3 {
  width: 320px; height: 320px;
  background: radial-gradient(ellipse, rgba(201,96,122,.09) 0%, transparent 70%);
  top: 50%; left: -80px;
  animation: orbB 16s ease-in-out infinite reverse;
}
@keyframes orbA { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.07)} }
@keyframes orbB { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

/* ── NOISE ── */
.s-noise {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* ── WRAPPER ── */
.s-wrapper { position: relative; z-index: 2; }

/* ── NAV ── */
.s-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 1.2rem 2.5rem;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(12,12,15,.72);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
}
.s-nav-logo {
  font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 700;
  color: var(--white); text-decoration: none; cursor: none;
  display: flex; align-items: center; gap: .3rem;
}
.s-nav-logo-sub { font-size: .78rem; font-weight: 400; color: var(--gray); letter-spacing: .04em; }
.s-nav-pills { display: flex; gap: .7rem; align-items: center; }
.s-pill {
  font-family: 'Outfit', sans-serif; font-size: .84rem; font-weight: 500;
  padding: .48rem 1.15rem; border-radius: 100px;
  text-decoration: none; cursor: none; transition: all .25s;
}
.s-pill-ghost { border: 1px solid var(--border2); color: var(--white); background: transparent; }
.s-pill-ghost:hover { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.22); }
.s-pill-solid { background: var(--white); color: var(--bg); font-weight: 600; border: 1px solid transparent; }
.s-pill-solid:hover { background: rgba(240,237,242,.88); }
.s-pill-active { background: rgba(201,96,122,.14); border: 1px solid rgba(201,96,122,.38); color: var(--rose-bright); }

/* ── HERO ── */
.s-hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 8rem 2rem 6rem;
  position: relative; overflow: hidden;
}
/* subtle grid */
.s-hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(201,96,122,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,96,122,.03) 1px, transparent 1px);
  background-size: 68px 68px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 100%);
}
.s-hero-tag {
  font-family: 'Syne', sans-serif; font-size: .68rem; font-weight: 700;
  letter-spacing: .25em; text-transform: uppercase; color: var(--rose-bright);
  display: flex; align-items: center; gap: .7rem; margin-bottom: 1.8rem;
  opacity: 0; animation: fadeUp .8s .3s ease forwards;
}
.s-hero-tag::before, .s-hero-tag::after {
  content: ''; display: block; width: 22px; height: 1px;
  background: var(--rose); opacity: .55;
}
.s-hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 8.5vw, 8rem);
  line-height: 1.0; color: var(--white);
  margin-bottom: 1.6rem; max-width: 880px;
  opacity: 0; animation: fadeUp 1s .5s ease forwards;
}
.s-hero-title em {
  font-style: italic;
  background: linear-gradient(120deg, var(--rose-bright), var(--purple));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.s-hero-sub {
  font-size: clamp(.95rem, 1.8vw, 1.1rem); font-weight: 300;
  color: var(--white-dim); max-width: 500px; line-height: 1.85;
  opacity: 0; animation: fadeUp .8s .7s ease forwards;
}

/* scroll hint */
.s-scroll {
  position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  opacity: 0; animation: fadeUp .8s 1.2s ease forwards;
}
.s-scroll-line {
  width: 1px; height: 36px;
  background: linear-gradient(to bottom, rgba(201,96,122,.6), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse { 0%,100%{opacity:.3} 50%{opacity:1} }

/* ── MANIFESTO STRIP ── */
.s-manifesto {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  padding: 3.5rem 2.5rem;
  overflow: hidden;
}
.s-manifesto-inner {
  max-width: 820px; margin: 0 auto; text-align: center;
}
.s-manifesto-quote {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  line-height: 1.4; color: var(--white); font-style: italic;
}
.s-manifesto-quote em {
  background: linear-gradient(120deg, var(--rose-bright), var(--purple));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  font-style: italic;
}
.s-manifesto-attr {
  margin-top: 1.2rem;
  font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700;
  letter-spacing: .2em; text-transform: uppercase; color: var(--gray);
}

/* ── SECTION ── */
.s-section { max-width: 1060px; margin: 0 auto; padding: 7rem 2.5rem; }
.s-section-tag {
  font-family: 'Syne', sans-serif; font-size: .68rem; font-weight: 700;
  letter-spacing: .25em; text-transform: uppercase; color: var(--rose-bright); margin-bottom: 1rem;
}
.s-section-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.08;
  color: var(--white); margin-bottom: 1rem;
}
.s-section-title em { font-style: italic; color: var(--white-dim); }
.s-section-body {
  font-size: .97rem; font-weight: 300; color: var(--white-dim);
  line-height: 1.85; max-width: 560px; margin-bottom: 3.5rem;
}

/* ── ORIGIN STORY ── */
.s-story {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start;
}
.s-story-text { display: flex; flex-direction: column; gap: 1.4rem; }
.s-story-text p {
  font-size: .97rem; font-weight: 300; color: var(--white-dim); line-height: 1.9;
}
.s-story-text p strong { color: var(--white); font-weight: 500; }
.s-story-aside {
  display: flex; flex-direction: column; gap: 1rem;
  padding-top: .5rem;
}
.s-aside-card {
  border: 1px solid var(--border); border-radius: 14px;
  padding: 1.8rem; background: var(--bg2);
  position: relative; overflow: hidden;
  transition: border-color .3s, background .3s;
}
.s-aside-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,96,122,.4), transparent);
  opacity: 0; transition: opacity .4s;
}
.s-aside-card:hover { border-color: rgba(201,96,122,.28); background: #14141a; }
.s-aside-card:hover::before { opacity: 1; }
.s-aside-num {
  font-family: 'DM Serif Display', serif;
  font-size: 2.6rem; line-height: 1;
  background: linear-gradient(120deg, var(--rose-bright), var(--purple));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: .3rem;
}
.s-aside-label {
  font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700;
  letter-spacing: .15em; text-transform: uppercase; color: var(--gray);
}

/* ── VALUES ── */
.s-values-outer {
  border-top: 1px solid var(--border);
  background: var(--bg2);
  padding: 7rem 2.5rem;
}
.s-values-inner { max-width: 1060px; margin: 0 auto; }
.s-values-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1.5px; background: var(--border);
  border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
}
.s-value {
  background: var(--bg); padding: 2.5rem;
  position: relative; overflow: hidden;
  transition: background .3s;
}
.s-value::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--rose), var(--purple));
  transform: scaleX(0); transform-origin: left;
  transition: transform .4s ease;
}
.s-value:hover { background: #0f0f14; }
.s-value:hover::after { transform: scaleX(1); }
.s-value-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(201,96,122,.08); border: 1px solid rgba(201,96,122,.18);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.4rem;
}
.s-value h3 {
  font-family: 'Syne', sans-serif; font-size: .95rem; font-weight: 700;
  color: var(--white); margin-bottom: .6rem;
}
.s-value p {
  font-size: .88rem; font-weight: 300;
  color: var(--white-dim); line-height: 1.75;
}

/* ── TEAM ── */
.s-team-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem;
}
.s-member {
  border: 1px solid var(--border); border-radius: 18px;
  overflow: hidden; background: var(--bg2);
  transition: border-color .3s, transform .3s;
}
.s-member:hover { border-color: rgba(201,96,122,.28); transform: translateY(-3px); }
.s-member-avatar {
  height: 200px; position: relative; overflow: hidden;
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
}
/* gradient placeholder avatar */
.s-avatar-bg {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(201,96,122,.2) 0%, rgba(132,72,172,.15) 100%);
}
.s-avatar-initials {
  font-family: 'DM Serif Display', serif;
  font-size: 3rem; font-style: italic;
  background: linear-gradient(120deg, var(--rose-bright), var(--purple));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  position: relative; z-index: 1;
}
.s-member-info { padding: 1.6rem; }
.s-member-name {
  font-family: 'Syne', sans-serif; font-size: .95rem; font-weight: 700;
  color: var(--white); margin-bottom: .2rem;
}
.s-member-role {
  font-family: 'Syne', sans-serif; font-size: .68rem; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase; color: var(--rose-bright);
  margin-bottom: .7rem;
}
.s-member-bio {
  font-size: .84rem; font-weight: 300;
  color: var(--white-dim); line-height: 1.7;
}

/* ── TIMELINE ── */
.s-timeline { display: flex; flex-direction: column; gap: 0; max-width: 680px; }
.s-timeline-item {
  display: grid; grid-template-columns: 100px 1fr;
  gap: 2rem; padding: 2rem 0;
  border-bottom: 1px solid var(--border);
  transition: padding-left .3s;
}
.s-timeline-item:last-child { border-bottom: none; }
.s-timeline-item:hover { padding-left: .6rem; }
.s-timeline-year {
  font-family: 'DM Serif Display', serif;
  font-size: 1.6rem; color: rgba(201,96,122,.22); line-height: 1;
  padding-top: .2rem; transition: color .3s;
}
.s-timeline-item:hover .s-timeline-year { color: rgba(201,96,122,.55); }
.s-timeline-content h4 {
  font-family: 'Syne', sans-serif; font-size: .92rem; font-weight: 700;
  color: var(--white); margin-bottom: .35rem;
}
.s-timeline-content p {
  font-size: .87rem; font-weight: 300;
  color: var(--white-dim); line-height: 1.75;
}

/* ── CTA ── */
.s-cta {
  text-align: center; padding: 9rem 2.5rem;
  position: relative; overflow: hidden;
  border-top: 1px solid var(--border);
}
.s-cta::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 65% 55% at 50% 100%, rgba(201,96,122,.1), transparent);
  pointer-events: none;
}
.s-cta-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1.06; color: var(--white);
  max-width: 660px; margin: 0 auto 1.2rem; position: relative;
}
.s-cta-title em {
  font-style: italic;
  background: linear-gradient(120deg, var(--rose-bright), var(--purple));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.s-cta-sub {
  font-size: .97rem; font-weight: 300; color: var(--gray);
  max-width: 360px; margin: 0 auto 2.5rem; line-height: 1.8; position: relative;
}
.s-cta-btns { display: flex; gap: .8rem; justify-content: center; position: relative; }
.s-btn-primary {
  background: var(--white); color: var(--bg); border: none; border-radius: 100px;
  padding: .85rem 2.2rem; font-family: 'Syne', sans-serif; font-size: .85rem;
  font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  text-decoration: none; cursor: none; transition: background .2s, transform .2s;
}
.s-btn-primary:hover { background: rgba(240,237,242,.88); transform: translateY(-1px); }
.s-btn-ghost {
  font-family: 'Syne', sans-serif; font-size: .82rem; font-weight: 600;
  letter-spacing: .06em; text-transform: uppercase; color: var(--white-dim);
  text-decoration: none; cursor: none; display: flex; align-items: center; gap: .4rem; transition: color .2s;
}
.s-btn-ghost:hover { color: var(--white); }
.s-btn-ghost::after { content: '→'; transition: transform .2s; }
.s-btn-ghost:hover::after { transform: translateX(3px); }

/* ── FOOTER ── */
.s-footer {
  padding: 2.2rem 2.5rem; border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.s-footer-logo { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700; color: var(--white-dim); }
.s-footer-logo span { color: var(--gray); font-weight: 400; font-size: .8rem; }
.s-footer-links { display: flex; gap: 1.8rem; list-style: none; }
.s-footer-links a {
  font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase; color: var(--gray);
  text-decoration: none; cursor: none; transition: color .2s;
}
.s-footer-links a:hover { color: var(--white); }
.s-footer-note { font-size: .75rem; color: var(--gray); }

/* ── REVEAL ── */
.s-reveal { opacity: 0; transform: translateY(26px); transition: opacity .75s ease, transform .75s ease; }
.s-reveal.visible { opacity: 1; transform: translateY(0); }

@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

@media (max-width: 900px) {
  .s-nav { padding: 1rem 1.5rem; }
  .s-nav-pills .s-pill-ghost:not(:last-child) { display: none; }
  .s-story { grid-template-columns: 1fr; gap: 2.5rem; }
  .s-values-grid, .s-team-grid { grid-template-columns: 1fr; }
  .s-section { padding: 4.5rem 1.5rem; }
  .s-values-outer { padding: 4.5rem 1.5rem; }
  .s-cta { padding: 5.5rem 1.5rem; }
  .s-footer { flex-direction: column; gap: 1.2rem; text-align: center; }
  .s-footer-links { flex-wrap: wrap; justify-content: center; }
  .s-cta-btns { flex-direction: column; align-items: center; }
}
`;

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const VALUES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e07090" strokeWidth="1.5">
        <path d="M10 2l2 5h5l-4 3 1.5 5L10 13l-4.5 2.5L7 10 3 7h5z"/>
      </svg>
    ),
    title: 'El estudiante primero',
    body: 'Cada decisión que tomamos comienza con una pregunta: ¿esto le hace la vida más fácil al estudiante? No al mercado. No al algoritmo. Al estudiante.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e07090" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7"/>
        <path d="M7 10l2 2 4-4"/>
      </svg>
    ),
    title: 'Honestidad radical',
    body: 'No prometemos magia. Prometemos una herramienta que funciona, que tiene límites claros y que te decimos exactamente qué puede y qué no puede hacer.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e07090" strokeWidth="1.5">
        <path d="M3 10h4l3-7 4 14 3-7h3"/>
      </svg>
    ),
    title: 'Simple hasta doler',
    body: 'Si necesitas leer un tutorial para usar Echo, fallamos. La complejidad es nuestra responsabilidad, no la tuya. Cada feature tiene que ganarse su lugar.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e07090" strokeWidth="1.5">
        <rect x="3" y="3" width="6" height="6" rx="1"/>
        <rect x="11" y="3" width="6" height="6" rx="1"/>
        <rect x="3" y="11" width="6" height="6" rx="1"/>
        <rect x="11" y="11" width="6" height="6" rx="1" opacity=".4"/>
      </svg>
    ),
    title: 'Privacidad no negociable',
    body: 'Tus datos son tuyos. No los vendemos, no los usamos para entrenar modelos externos sin tu consentimiento, y puedes borrarlos cuando quieras.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e07090" strokeWidth="1.5">
        <path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/>
        <path d="M10 6v4l2 2"/>
      </svg>
    ),
    title: 'Velocidad sobre perfección',
    body: 'Preferimos lanzar algo bueno hoy y mejorarlo mañana. El feedback real de estudiantes reales vale más que meses de refinamiento en privado.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e07090" strokeWidth="1.5">
        <path d="M5 10l3 3 7-7"/>
        <circle cx="10" cy="10" r="8"/>
      </svg>
    ),
    title: 'Acceso para todos',
    body: 'Una buena herramienta no debería estar reservada para quien puede pagarla. Por eso Echo siempre tendrá una capa gratuita real, no un demo de 5 minutos.',
  },
];

const TEAM = [
  {
    initials: 'A',
    name: 'Arturo S.',
    role: 'Fundador & CEO',
    bio: 'Estudiante que se hartó de los prompts. Construyó Echo porque quería una herramienta que lo entendiera sin tener que explicarle todo.',
  },
  {
    initials: 'E',
    name: 'Equipo de diseño',
    role: 'Producto & UX',
    bio: 'Obsesionados con que cada interacción sea obvia. Si algo requiere instrucciones, lo rediseñamos hasta que no las necesite.',
  },
  {
    initials: 'T',
    name: 'Equipo técnico',
    role: 'Ingeniería & IA',
    bio: 'Los que hacen que Echo entienda sin que le expliques. Trabajan en el modelo de comprensión de intención que está detrás de todo.',
  },
];

const TIMELINE = [
  {
    year: '2024',
    title: 'La idea',
    body: 'Un estudiante frustra con prompts que nunca daban el resultado correcto. La pregunta: ¿y si la herramienta entendiera sin que le explicaras?',
  },
  {
    year: 'Ene 25',
    title: 'Primer prototipo',
    body: 'El primer build de Echo: solo texto plano a Google Docs con formato APA. Feo. Lento. Pero funcionaba. Los primeros 10 usuarios lo usaron todos los días.',
  },
  {
    year: 'Jun 25',
    title: 'LOVR como plataforma',
    body: 'Echo se convierte en el primer producto de LOVR. Se agrega memoria de estilo, exportación a Slides y soporte para múltiples formatos académicos.',
  },
  {
    year: '2026',
    title: 'Apertura para escuelas',
    body: 'Primer acuerdo institucional. Echo llega a aulas completas. Empieza el programa de acceso anticipado para el público general.',
  },
];

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function SobreNosotrosPage() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);

  /* cursor */
  useEffect(() => {
    const cur = cursorRef.current; const ring = ringRef.current;
    if (!cur || !ring) return;
    let mx=0,my=0,rx=0,ry=0; let raf:number;
    const onMove=(e:MouseEvent)=>{mx=e.clientX;my=e.clientY;};
    document.addEventListener('mousemove',onMove);
    const loop=()=>{rx+=(mx-rx)*.12;ry+=(my-ry)*.12;cur.style.left=mx-5+'px';cur.style.top=my-5+'px';ring.style.left=rx-17+'px';ring.style.top=ry-17+'px';raf=requestAnimationFrame(loop);};
    raf=requestAnimationFrame(loop);
    const grow=()=>{cur.style.transform='scale(2.2)';ring.style.width=ring.style.height='54px';ring.style.borderColor='rgba(201,96,122,.55)';};
    const shrink=()=>{cur.style.transform='scale(1)';ring.style.width=ring.style.height='34px';ring.style.borderColor='';};
    document.querySelectorAll('a,button').forEach(el=>{el.addEventListener('mouseenter',grow);el.addEventListener('mouseleave',shrink);});
    return ()=>{cancelAnimationFrame(raf);document.removeEventListener('mousemove',onMove);};
  },[]);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll('.s-reveal');
    const obs = new IntersectionObserver(
      entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),
      {threshold:.08}
    );
    els.forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  },[]);

  return (
    <>
      <style>{CSS}</style>
      <div className="s-orb s-orb-1" />
      <div className="s-orb s-orb-2" />
      <div className="s-orb s-orb-3" />
      <div className="s-noise" />
      <div ref={cursorRef} className="s-cursor" />
      <div ref={ringRef}   className="s-cursor-ring" />

      <div className="s-wrapper">

        <nav className="s-nav">
          <Link href="/" className="s-nav-logo">
            <span>Echo</span>
            <span className="s-nav-logo-sub">by LOVR</span>
          </Link>
          <div className="s-nav-pills">
            <Link href="/login"   className="s-pill s-pill-ghost">¿Ya tienes una cuenta?</Link>
            <Link href="/About"   className="s-pill s-pill-active">Sobre nosotros</Link>
            <Link href="/register"   className="s-pill s-pill-solid">Comenzar</Link>
          </div>
        </nav>

        <section className="s-hero">
          <div className="s-hero-grid" />
          <div className="s-hero-tag">Quiénes somos</div>
          <h1 className="s-hero-title">
            Desarrollado por y para<br />
            <em>estudiantes</em>
          </h1>
          <p className="s-hero-sub">
            Lidiar con el estrés escolar, recordar pendientes y tener que trabajar en cada tarea, una a la vez, es cosa del pasado...
          </p>
          <div className="s-scroll"><div className="s-scroll-line" /></div>
        </section>

        <div className="s-manifesto s-reveal">
          <div className="s-manifesto-inner">
            <p className="s-manifesto-quote">
              "Las herramientas deberían adaptarse a las personas,<br />
              no las personas <em>a las herramientas.</em>"
            </p>
          </div>
        </div>


        <section className="s-section s-reveal" style={{ paddingTop: '2rem' }}>
          <div className="s-section-tag">Historia</div>
          <h2 className="s-section-title" style={{ marginBottom: '2.5rem' }}>
            De la idea al<br /><em>producto real</em>
          </h2>
          <div className="s-timeline">
            {TIMELINE.map((t,i) => (
              <div key={i} className="s-timeline-item">
                <div className="s-timeline-year">{t.year}</div>
                <div className="s-timeline-content">
                  <h4>{t.title}</h4>
                  <p>{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="s-cta s-reveal">
          <h2 className="s-cta-title">
            ¿Quieres ser<br />parte de <em>LOVR?</em>
          </h2>
          <p className="s-cta-sub">
            Las personas correctas siempre llegan en el mejor momento, al mejor lugar.
          </p>
          <div className="s-cta-btns">
            <Link href="/register"  className="s-btn-primary">Comenzar</Link>
            <Link href="/contacto"  className="s-btn-ghost">Trabajar con nosotros</Link>
          </div>
        </section>

        <footer className="s-footer">
          <div className="s-footer-logo">Echo <span>by LOVR</span></div>
          <ul className="s-footer-links">
            <li><Link href="/privacy">Privacidad</Link></li>
            <li><Link href="/terms">Términos</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
          </ul>
          <div className="s-footer-note">© 2026 LOVR · All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}