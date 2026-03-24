'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const starRefs = useRef<HTMLDivElement[]>([]);
  const [countdown, setCountdown] = useState(8);

  /* ===============================
     Estrellas
  =============================== */
  useEffect(() => {
    starRefs.current.forEach(star => {
      if (!star) return;

      function randomizePosition() {
        const left = Math.random() * 100;
        star.style.left = `${left}%`;
      }

      star.addEventListener('animationiteration', randomizePosition);
      randomizePosition();

      return () => {
        star.removeEventListener('animationiteration', randomizePosition);
      };
    });
  }, []);

  /* ===============================
     Countdown + redirect
  =============================== */
  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = '/login';  // ← hard navigation, sin problemas de compilación
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  /* ===============================
     Render
  =============================== */
  return (
    <main className="flex flex-col items-start justify-start w-full min-h-screen relative px-4 overflow-hidden">

      {/* Blurred background glow */}
      <div className="blur-window-big" />


      {/* Floating stars */}
      {[2, 5, 8, 14].map((delay, i) => (
        <div
          key={i}
          ref={el => { if (el) starRefs.current[i] = el; }}
          className="star"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      {/* Main section */}
      <section className="h-screen w-full glass-dark z-10 border-x border-[#3B3440] flex flex-col items-center justify-center gap-8 p-11">

        {/* 404 heading */}
        <div className="flex flex-col items-center gap-2 select-none">
          <span
            className="register-color font-bold leading-none"
            style={{ fontSize: 'clamp(7rem, 20vw, 14rem)', lineHeight: 1 }}
          >
            404
          </span>
          <p className="text-[var(--gray-color)] text-xl tracking-widest uppercase">
            Página no encontrada
          </p>
        </div>

        {/* Divider */}
        <div className="w-40 h-px bg-gradient-to-r from-transparent via-[#835A65] to-transparent" />

        {/* Message */}
        <p className="text-[var(--white-color)] text-lg text-center max-w-md opacity-70">
          La ruta que buscas no existe o fue movida.
          <br />
          Serás redirigido al inicio de sesión en{' '}
          <span className="lovr-color font-semibold">{countdown}s</span>.
        </p>

        {/* CTA button */}
        <Link
          href="/login"
          className="link mt-2"
          style={{ fontSize: '17px' }}
        >
          Ir al login ahora
        </Link>

        {/* Countdown ring */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          className="opacity-50"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#3B3440"
            strokeWidth="3"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#eb6f6f"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1.1 - countdown / 8)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
            strokeLinecap="round"
          />
        </svg>

      </section>

    </main>
  );
}