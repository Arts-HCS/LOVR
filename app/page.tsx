'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface TerminalLine {
  id: number;
  html: string;
  cls: string;
  visible: boolean;
}

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
   CSS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500&display=swap');

.lovr-root *, .lovr-root *::before, .lovr-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}

:root {
  --bg:          #0d0e10;
  --bg2:         #111213;
  --bg3:         #0a0a0c;
  --primary:     #595fb1;
  --primary-dim: #595fb133;
  --primary-mid: #595fb177;
  --red:         #eb6f6f;
  --purple:      #8448ac;
  --white:       #dcd9de;
  --white-dim:   #dcd9de99;
  --gray:        #827989;
  --border:      #1e1f25;
  --border2:     #2a2b30;
}

.lovr-root {
  background-color: var(--bg);
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden;
  cursor: none;
  position: relative;
  min-height: 100vh;
  scroll-behavior: smooth;
}

::selection { background: #595fb144; color: var(--white); }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

/* ── CURSOR ── */
.lovr-cursor {
  position: fixed;
  width: 10px; height: 10px;
  background: var(--white);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.15s ease, background 0.2s ease;
  mix-blend-mode: difference;
}
.lovr-cursor-ring {
  position: fixed;
  width: 36px; height: 36px;
  border: 1px solid var(--primary-mid);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease, border-color 0.3s ease;
}

/* ── CANVAS ── */
.lovr-canvas {
  position: fixed; inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ── NOISE ── */
.lovr-noise {
  position: fixed; inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* ── WRAPPER ── */
.lovr-wrapper { position: relative; z-index: 2; }

/* ── NAV ── */
.lovr-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 1.6rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.4s ease, border-color 0.4s ease;
}
.lovr-nav.scrolled {
  background: rgba(13,14,16,0.82);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.lovr-nav-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 1.6rem;
  letter-spacing: 0.06em;
  background: linear-gradient(130deg, var(--red), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  animation: lovrFadeDown 0.8s 0.2s ease forwards;
}
.lovr-nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}
.lovr-nav-links a {
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray);
  text-decoration: none;
  cursor: none;
  transition: color 0.2s;
}
.lovr-nav-links a:hover { color: var(--white); }
.lovr-nav-cta {
  font-family: 'Syne', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--white-dim);
  border: 1px solid var(--border2);
  padding: 0.55rem 1.4rem;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.3s ease;
  opacity: 0;
  animation: lovrFadeDown 0.8s 0.4s ease forwards;
  cursor: none;
}
.lovr-nav-cta:hover {
  border-color: var(--primary);
  color: var(--white);
  box-shadow: 0 0 24px var(--primary-dim);
}

/* ── HERO ── */
.lovr-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 2rem 8rem;
  position: relative;
  overflow: hidden;
}
.lovr-hero-grid {
  position: absolute; inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(89,95,177,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(89,95,177,0.04) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
}
.lovr-hero-eyebrow {
  font-family: 'Syne', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 2rem;
  opacity: 0;
  animation: lovrFadeUp 0.8s 0.6s ease forwards;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.lovr-hero-eyebrow::before,
.lovr-hero-eyebrow::after {
  content: '';
  display: block;
  width: 28px; height: 1px;
  background: var(--primary);
  opacity: 0.5;
}
.lovr-hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3.6rem, 9vw, 8.5rem);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--white);
  margin-bottom: 1.8rem;
  opacity: 0;
  animation: lovrFadeUp 1s 0.8s ease forwards;
  max-width: 920px;
}
.lovr-hero-title em {
  font-style: italic;
  background: linear-gradient(130deg, var(--red), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lovr-hero-sub {
  font-size: clamp(1rem, 2vw, 1.15rem);
  font-weight: 300;
  color: var(--white-dim);
  max-width: 540px;
  line-height: 1.75;
  margin-bottom: 3rem;
  opacity: 0;
  animation: lovrFadeUp 0.8s 1s ease forwards;
}
.lovr-input-wrap {
  position: relative;
  width: 100%;
  max-width: 540px;
  opacity: 0;
  animation: lovrFadeUp 0.8s 1.2s ease forwards;
}
.lovr-input {
  width: 100%;
  background: rgba(89,95,177,0.04);
  border: 1px solid var(--border2);
  border-radius: 100px;
  padding: 1rem 1.5rem;
  padding-right: 8.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: var(--white);
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: none;
}
.lovr-input::placeholder { color: var(--gray); }
.lovr-input:focus {
  border-color: var(--primary-mid);
  box-shadow: 0 0 32px var(--primary-dim);
}
.lovr-send {
  position: absolute;
  right: 6px; top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(130deg, var(--red), var(--purple));
  border: none;
  border-radius: 100px;
  padding: 0.58rem 1.4rem;
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  cursor: none;
  transition: opacity 0.2s, transform 0.2s;
}
.lovr-send:hover { opacity: 0.85; transform: translateY(-50%) scale(0.97); }
.lovr-hero-hint {
  margin-top: 1.2rem;
  font-size: 0.78rem;
  color: var(--gray);
  letter-spacing: 0.04em;
  opacity: 0;
  animation: lovrFadeUp 0.8s 1.4s ease forwards;
}
.lovr-hero-hint span {
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 2px 7px;
  font-family: 'Syne', sans-serif;
  font-size: 0.72rem;
  color: var(--primary);
  margin: 0 3px;
  background: var(--primary-dim);
}
.lovr-scroll-hint {
  position: absolute;
  bottom: 2.5rem; left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  opacity: 0;
  animation: lovrFadeUp 0.8s 1.9s ease forwards;
}
.lovr-scroll-hint span {
  font-size: 0.64rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gray);
  font-family: 'Syne', sans-serif;
}
.lovr-scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, var(--primary), transparent);
  animation: lovrScrollPulse 2.2s ease-in-out infinite;
}
@keyframes lovrScrollPulse { 0%,100%{opacity:.25} 50%{opacity:1} }

/* ── MARQUEE STRIP ── */
.lovr-strip {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  padding: 1.1rem 0;
  overflow: hidden;
}
.lovr-strip-inner {
  display: flex;
  gap: 0;
  animation: lovrMarquee 22s linear infinite;
  white-space: nowrap;
}
.lovr-strip-item {
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gray);
  padding: 0 2.8rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  transition: color 0.3s;
}
.lovr-strip-item:hover { color: var(--white); }
.lovr-strip-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--red), var(--purple));
  flex-shrink: 0;
}
@keyframes lovrMarquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── SHARED SECTION ── */
.lovr-section {
  padding: 7rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}
.lovr-section-label {
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 1.2rem;
}
.lovr-section-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1.08;
  color: var(--white);
  margin-bottom: 4rem;
}
.lovr-section-title em { font-style: italic; color: var(--gray); }

/* ── STEPS ── */
.lovr-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.lovr-step {
  background: var(--bg2);
  padding: 2.8rem;
  position: relative;
  transition: background 0.35s;
  overflow: hidden;
}
.lovr-step::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(89,95,177,0.07), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
}
.lovr-step:hover { background: #13141a; }
.lovr-step:hover::before { opacity: 1; }
.lovr-step-num {
  font-family: 'DM Serif Display', serif;
  font-size: 3.2rem;
  color: #1a1b22;
  line-height: 1;
  margin-bottom: 1.6rem;
  transition: color 0.35s;
}
.lovr-step:hover .lovr-step-num { color: #252738; }
.lovr-step-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 0.8rem;
  letter-spacing: 0.02em;
}
.lovr-step-body {
  font-size: 0.88rem;
  font-weight: 300;
  color: var(--white-dim);
  line-height: 1.75;
}
.lovr-step-accent {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--purple));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}
.lovr-step:hover .lovr-step-accent { transform: scaleX(1); }

/* ── FEATURES ── */
.lovr-features-outer {
  padding: 5rem 3rem 7rem;
  border-top: 1px solid var(--border);
  background: var(--bg2);
}
.lovr-features-inner { max-width: 1100px; margin: 0 auto; }
.lovr-features-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: end;
  margin-bottom: 4rem;
}
.lovr-features-body {
  font-size: 0.95rem;
  font-weight: 300;
  color: var(--white-dim);
  line-height: 1.8;
  max-width: 480px;
}
.lovr-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.lovr-feature-card {
  background: var(--bg);
  padding: 2.4rem;
  position: relative;
  overflow: hidden;
  transition: background 0.3s;
}
.lovr-feature-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0;
  transition: opacity 0.4s;
}
.lovr-feature-card:hover { background: #0f1015; }
.lovr-feature-card:hover::after { opacity: 1; }
.lovr-feature-num {
  font-family: 'Syne', sans-serif;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--primary);
  margin-bottom: 1.4rem;
}
.lovr-feature-icon {
  width: 32px; height: 32px;
  margin-bottom: 1.2rem;
  opacity: 0.55;
  transition: opacity 0.3s;
}
.lovr-feature-card:hover .lovr-feature-icon { opacity: 0.9; }
.lovr-feature-card h3 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: var(--white);
  margin-bottom: 0.7rem;
}
.lovr-feature-card p {
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--white-dim);
  line-height: 1.7;
}

/* ── TERMINAL DEMO ── */
.lovr-demo-section {
  padding: 6rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}
.lovr-terminal {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px #ffffff05;
}
.lovr-terminal-bar {
  background: #0f1014;
  padding: 0.9rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.t-dot { width: 10px; height: 10px; border-radius: 50%; }
.t-dot-red    { background: rgba(235,111,111,0.4); }
.t-dot-yellow { background: rgba(177,158,89,0.4); }
.t-dot-green  { background: rgba(90,177,153,0.4); }
.lovr-t-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem;
  color: var(--gray);
  letter-spacing: 0.12em;
  margin-left: auto;
  margin-right: auto;
  padding-right: 3rem;
}
.lovr-terminal-body {
  padding: 2rem 2.2rem 2.8rem;
  min-height: 260px;
}
.t-line {
  font-family: 'Outfit', monospace;
  font-size: 0.9rem;
  line-height: 1.8;
  margin-bottom: 0.15rem;
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.t-user  { color: var(--gray); }
.t-user span { color: var(--primary); }
.t-ai    { color: #c0c2d7; }
.t-tag {
  display: inline-block;
  background: rgba(89,95,177,0.1);
  border: 1px solid rgba(89,95,177,0.25);
  border-radius: 5px;
  padding: 1px 8px;
  font-size: 0.78rem;
  color: var(--primary);
  margin: 0 2px;
}
.t-success { color: #5ab199; }
.t-file {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #14151c;
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  color: var(--white-dim);
  margin-top: 0.25rem;
}
.t-cursor {
  display: inline-block;
  width: 8px; height: 15px;
  background: var(--primary);
  border-radius: 2px;
  animation: lovrBlink 1.1s step-end infinite;
  vertical-align: middle;
  margin-left: 2px;
}
@keyframes lovrBlink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── STATEMENT / CTA ── */
.lovr-statement {
  padding: 10rem 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--border);
}
.lovr-statement-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 100%, rgba(89,95,177,0.08), transparent);
  pointer-events: none;
}
.lovr-statement-bg2 {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 50% 40% at 50% 50%, rgba(132,72,172,0.05), transparent);
  pointer-events: none;
}
.lovr-statement-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 7vw, 6rem);
  line-height: 1.06;
  color: var(--white);
  max-width: 760px;
  margin: 0 auto 2rem;
  position: relative;
}
.lovr-statement-title em {
  font-style: italic;
  background: linear-gradient(130deg, var(--red), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lovr-statement-sub {
  font-size: 1rem;
  font-weight: 300;
  color: var(--gray);
  max-width: 440px;
  margin: 0 auto 3.5rem;
  line-height: 1.8;
  position: relative;
}
.lovr-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(130deg, var(--red), var(--purple));
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 0.9rem 2.4rem;
  border-radius: 100px;
  transition: all 0.3s ease;
  position: relative;
  cursor: none;
  border: none;
}
.lovr-cta-btn:hover {
  transform: scale(1.04);
  box-shadow: 0 0 50px rgba(132,72,172,0.35);
}
.lovr-cta-arrow { display: inline-block; transition: transform 0.3s; }
.lovr-cta-btn:hover .lovr-cta-arrow { transform: translateX(4px); }

/* ── FOOTER ── */
.lovr-footer {
  padding: 3rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lovr-footer-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 1.2rem;
  background: linear-gradient(130deg, var(--red), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lovr-footer-links {
  display: flex; gap: 2rem; list-style: none;
}
.lovr-footer-links a {
  font-family: 'Syne', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray);
  text-decoration: none;
  cursor: none;
  transition: color 0.2s;
}
.lovr-footer-links a:hover { color: var(--white); }
.lovr-footer-note { font-size: 0.78rem; color: var(--gray); letter-spacing: 0.04em; }

/* ── REVEAL ── */
.lovr-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.75s ease, transform 0.75s ease;
}
.lovr-reveal.visible { opacity: 1; transform: translateY(0); }

/* ── KEYFRAMES ── */
@keyframes lovrFadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lovrFadeDown {
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .lovr-nav { padding: 1.2rem 1.5rem; }
  .lovr-nav-links { display: none; }
  .lovr-steps,
  .lovr-feature-grid,
  .lovr-features-header { grid-template-columns: 1fr; }
  .lovr-section,
  .lovr-demo-section,
  .lovr-features-outer { padding-left: 1.5rem; padding-right: 1.5rem; }
  .lovr-statement { padding: 6rem 1.5rem; }
  .lovr-footer { flex-direction: column; gap: 1.2rem; text-align: center; }
  .lovr-footer-links { flex-wrap: wrap; justify-content: center; }
}
`;

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
      <style>{CSS}</style>
      <canvas ref={canvasRef} className="lovr-canvas" />
      <div className="lovr-noise" />
      <div ref={cursorRef} className="lovr-cursor" />
      <div ref={ringRef}   className="lovr-cursor-ring" />

      <div className="lovr-wrapper">

        <nav className={`lovr-nav${scrolled ? ' scrolled' : ''}`}>
          <div className="lovr-nav-logo">LOVR</div>
          <ul className="lovr-footer-links">
            <li><Link href={"/privacy"}>Privacidad</Link></li>
            <li><Link href={"/terms"}>Términos</Link></li>
            <li><Link href={"/contacto"}>Contacto</Link></li>
          </ul>
          
          <Link href="/register" className="lovr-nav-cta">Comenzar</Link>
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
            Escribe cualquier cosa: <span>Reporte de laboratorio</span> | <span>Presentación de proyecto</span>... lo que quieras
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
                body: 'Escribe tus pendientes como si estuvieras platicando, ¡sin formato! Menciona su hora y día de entrega. Cualquier forma de hacerlo es correcta.',
              },
              {
                n: '02',
                title: 'Ahorra tiempo',
                body: 'Escribir prompts lleva tiempo... mejor sólo copia y pega toda la información que necesitarías para hacer la tarea. No expliques qué hacer, LOVR lo entenderá.',
              },
              {
                n: '03',
                title: 'Trabaja con tus resultados',
                body: 'Exporta a Google Docs con formatos APA o MLA, a Google Slides, y a tu LOVR: la versión del trabajo generado con tu estilo de escritura.',
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
            <span className="lovr-cta-arrow">→</span>
          </Link>
        </section>

        <footer className="lovr-footer">
          <div className="lovr-footer-logo">LOVR</div>
          <ul className="lovr-footer-links">
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