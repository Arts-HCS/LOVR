"use client";

import { useEffect, useState } from "react";

import LoverBoard from "../dashbordComponents/LoverBoard";

import Documents from "@/components/lovrComponents/documents";
import LovrModels from "../lovrComponents/lovrModels";

export default function BigHeartComponent({ activeUser, setActiveUser }: { activeUser: any, setActiveUser: (active:any) => void }) {
  const [lovrCreated, setLoverCreated] = useState(false);
  const [onBoardActive, setOnBoardActive] = useState(false);

  const [activeDocuments, setActiveDcuments] = useState(false);
  const [activeTraining, setActiveTraining] = useState(false);
  const [activeModels, setActiveModels] = useState(false);
  const [activeUsage, setActiveUsage] = useState(false);

  useEffect(() => {
    const updateActiveUser = async () => {
      const resp = await fetch("/api/userWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUser.id }),
      });
      const user = await resp.json();
      setActiveUser(user);
    };
    updateActiveUser();

    if (activeUser.modelName) {
      setLoverCreated(true);
    }
  }, []);

  return (
    <section className="bg-[#1c1d20] w-full h-full p-3 relative border-t border-[#A4767F] flex items-center justify-center overflow-hidden">
      <div className="white-blur"></div>

      {!lovrCreated ? (
        <>
          {onBoardActive && (
            <LoverBoard
              setOnBoardActive={setOnBoardActive}
              activeUser={activeUser}
              setLoverCreated={setLoverCreated}
            />
          )}
          <button
            onClick={() => setOnBoardActive(true)}
            className="w-fit h-fit z-1 cursor-pointer hover:scale-95 transition-all flex items-center justify-center relative"
          >
            <i className="fa-solid fa-heart text-[10rem] sm:text-[16rem] lg:text-[23rem] text-[#20222595] [-webkit-text-stroke:2px_#7D7D81] drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" />
          </button>
        </>
      ) : (
        <>
          {activeDocuments && (
            <Documents setActiveDocuments={setActiveDcuments} activeDocuments={activeDocuments} activeUser={activeUser} />
          )}
          {activeModels && (
            <LovrModels activeModels={activeModels} setActiveModels={setActiveModels} activeUser={activeUser} />
          )}

          {/* Corazón central */}
          <button className="w-fit h-fit z-1 flex items-center justify-center relative">
            <i className="fa-solid fa-heart text-[8rem] sm:text-[12rem] lg:text-[17rem] text-[#20222595] [-webkit-text-stroke:2px_#7D7D81] drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" />
          </button>

          {/* Botones en mobile: grid 2x2 debajo del corazón */}
          <div className="absolute bottom-4 left-0 right-0 px-4 grid grid-cols-2 gap-3 sm:hidden z-10">
            <button
              className="text-base cursor-pointer transition hover:scale-90 h-16 rounded-2xl bg-[#202225ac] shadow-2xl border border-[#7D7D81]"
              onClick={() => setActiveDcuments(!activeDocuments)}
            >
              Documentos
            </button>
            <button
              className="text-base cursor-pointer transition hover:scale-90 h-16 rounded-2xl bg-[#202225ac] shadow-2xl border border-[#7D7D81]"
              onClick={() => setActiveModels(!activeModels)}
            >
              Modelos
            </button>
            <button className="text-base pointer-events-none transition h-16 rounded-2xl bg-[#202225ac] shadow-2xl border border-[#7D7D81] text-[#494349]">
              Entrenamiento
            </button>
            <button className="text-base pointer-events-none transition h-16 rounded-2xl bg-[#202225ac] shadow-2xl border border-[#7D7D81] text-[#494349]">
              Uso
            </button>
          </div>

          {/* Botones en desktop: posición fija original */}
          <button
            className="hidden sm:block fixed text-xl cursor-pointer transition hover:scale-90 h-30 w-70 rounded-2xl top-45 left-40 bg-[#202225ac] shadow-2xl border border-[#7D7D81]"
            onClick={() => setActiveDcuments(!activeDocuments)}
          >
            Documentos
          </button>
          <button
            className="hidden sm:block fixed text-xl cursor-pointer transition hover:scale-90 h-30 w-70 rounded-2xl top-35 right-35 bg-[#202225ac] shadow-2xl border border-[#7D7D81]"
            onClick={() => setActiveModels(!activeModels)}
          >
            Modelos
          </button>
          <button className="hidden sm:block fixed text-xl pointer-events-none transition hover:scale-90 h-30 w-70 rounded-2xl bottom-30 left-60 bg-[#202225ac] shadow-2xl border border-[#7D7D81] text-[#494349]">
            Entrenamiento
          </button>
          <button className="hidden sm:block fixed text-xl pointer-events-none transition hover:scale-90 h-30 w-70 rounded-2xl bottom-40 right-50 bg-[#202225ac] shadow-2xl border border-[#7D7D81] text-[#494349]">
            Uso
          </button>
        </>
      )}
    </section>
  );
}