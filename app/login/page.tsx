'use client';

import { useEffect, useRef, useState } from 'react';

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import LoginForm from '@/components/utils/loginform';
import Link from 'next/link';

export default function Login(){


  const starRefs = useRef<HTMLDivElement[]>([]);

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


  const texts = [
    'Tú.\nComo Nunca Antes.',
    'El \nnuevo \nestándar.',
    'Tú.\n1000 lugares a la vez.',
    'Reescribe las \nreglas del juego.\n',
    'Domina \ntu \nmundo.'
  ];

  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      timeout = setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, 70);
    } else {
      timeout = setTimeout(() => {
        setText(current.slice(0, text.length - 1));
      }, 35);
    }

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), 5200);
    }

    if (isDeleting && text === '') {
      setIsDeleting(false);
      setIndex((index + 1) % texts.length);
    }

    return () => clearTimeout(timeout);

  }, [text, isDeleting, index]);


  /* ===============================
     Render
  =============================== */

  return (
    <main className="flex flex-col items-start justify-start w-full relative px-4 cut-corners overflow-hidden">

      <div className="blur-window-big"></div>

      {[1, 4, 9, 16].map((delay, i) => (
        <div
          key={i}
          ref={el => {
            if (el) starRefs.current[i] = el;
          }}
          className="star"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      <Header loginBtn={false}/>

      <section className="min-h-[90vh] w-full glass-dark z-100 border-x border-[#3B3440] flex flex-col xl:flex-row items-start justify-start p-5 xl:p-11">

        <div className="flex-1 h-full flex flex-col w-full">

          <h3 className="text-[35px] xl:text-[53px] text-(--white-color) font-medium mb-6">
            Iniciar sesión
          </h3>

          <LoginForm />

          <Link 
  href="/register"
  className="
    py-4 px-6 mt-10 w-full xl:w-[70%]
    text-center text-xl font-medium
    rounded-2xl

    text-white/80
    bg-[#111213aa]
    
    border border-white/10

    backdrop-blur-md
    transition-all duration-300

    hover:bg-white/10
    hover:border-white/20
    hover:text-white

    active:scale-95
  "
>
  Crear una cuenta
</Link>

        </div>

        <div className="hidden xl:block w-150">

          <h4 className="text-9xl font-normal whitespace-pre-line register-color h-full">
            {text}
            <span className="animate-pulse">|</span>
          </h4>

        </div>

      </section>

      <Footer />

    </main>
  );
}