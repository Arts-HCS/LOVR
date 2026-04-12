"use client";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import RegisterForm from "@/components/utils/registerform";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function register() {
  const [baseText, setBaseText] = useState("Comienza a \nenamorarte");

  const [baseTyped, setBaseTyped] = useState("");
  const [nameTyped, setNameTyped] = useState("");
  const [gottenName, setGottenName] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      i++;

      setBaseTyped(baseText.slice(0, i));

      if (i >= baseText.length) {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [baseText]);

  useEffect(() => {
    if (!gottenName) return;

    let i = 0;
    setNameTyped("");

    const interval = setInterval(() => {
      i++;

      setNameTyped(gottenName.slice(0, i));

      if (i >= gottenName.length) {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [gottenName]);

  /* ===============================
     Estrellas
  =============================== */

  const starRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    starRefs.current.forEach((star) => {
      if (!star) return;

      function randomizePosition() {
        const left = Math.random() * 100;
        star.style.left = `${left}%`;
      }

      star.addEventListener("animationiteration", randomizePosition);
      randomizePosition();

      return () => {
        star.removeEventListener("animationiteration", randomizePosition);
      };
    });
  }, []);

  return (
    <main className="flex flex-col px-4 overflow-hidden relative">
      <div className="second-blur-window-big"></div>
      {[1, 4, 9, 16].map((delay, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) starRefs.current[i] = el;
          }}
          className="star-bottom"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      <Header loginBtn={true}></Header>
      <section className="flex flex-col xl:flex-row items-start justify-start z-10 min-h-screen">
        <div className="w-full xl:w-[45%] rounded-br-3xl rounded-tr-3xl glass-dark-all-borders h-fit p-5 xl:p-9 flex flex-col">
          <h3 className="text-[35px] xl:text-[53px] text-(--white-color) font-medium mb-2">
            Crear cuenta
          </h3>

          {success ? (
            <div className="flex-1 flex flex-col items-center justify-between py-8">

              <div />

              <div className="flex flex-col items-center gap-5">

                <div className="text-center flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.2em] opacity-40 text-(--white-color)">
                    Cuenta creada
                  </p>
                  <h2 className="text-3xl xl:text-4xl font-medium text-(--white-color)">
                    ¡Qué gusto,{" "}
                    <span style={{ color: "#eb6f6f" }}>{gottenName}!</span>
                  </h2>
                  <p className="text-sm opacity-35 text-[16px] text-(--white-color) mt-1 mb-8">
                    Ya puedes iniciar sesión y comenzar a usar LOVR
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full text-center py-4 rounded-full text-(--white-color) text-base tracking-wide transition-all hover:opacity-80 active:scale-95"
                style={{
                  background: "rgba(235,111,111,0.12)",
                  border: "1px solid rgba(235,111,111,0.3)",
                }}
              >
                Iniciar sesión →
              </Link>
            </div>
          ) : (
            <RegisterForm
              setBaseText={setBaseText}
              setGottenName={setGottenName}
              setSuccess={setSuccess}
            />
          )}
        </div>
        <div className="hidden xl:flex h-full w-[55%] items-center justify-start pt-20 px-5 flex-col">
          <h4 className="text-9xl whitespace-pre-line font-medium register-color text-center h-[62%]">
            {baseTyped}
            <span className="capitalize">{gottenName && `, ${nameTyped}`}</span>
          </h4>
          {baseText === "Tu cuenta ya existe" && (
            <Link
              className="text-2xl text-(--white-color) glass-dark-all-borders bg-[rgba(0,0,0,0.7)] px-10 py-5 rounded-full hover:bg-[rgba(0,0,0,0.4)] transition-all"
              href={"/login"}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </section>

      <Footer></Footer>
    </main>
  );
}
