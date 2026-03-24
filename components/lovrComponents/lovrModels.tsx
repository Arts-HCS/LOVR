import { useEffect, useRef, useState } from "react";

export default function LovrModels({
  activeModels,
  setActiveModels,
  activeUser,
}: {
  activeModels: boolean;
  setActiveModels: (active: boolean) => void;
  activeUser: any;
}) {
  const modelName = activeUser.modelName;

  const [nombreDeLaVersion, setNombreDeLaVersion] = useState("");
  const [nombrar, setNombrar] = useState(false);
  const [savedModels, setSavedModels] = useState<any[]>([]);
  const [chosenModelID, setChosenModelID] = useState<string | null>(null);
  const [notSamples, setNotSamples] = useState(false);
  const [openDescID, setOpenDescID] = useState<string | null>(null);
  const [loading, setLoading] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateActiveUser = async () => {
      const resp = await fetch("/api/userWelcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUser.id }),
      });
      const user = await resp.json();
      setChosenModelID(user.modelID);
    };

    const getUserModels = async () => {
      const res = await fetch("/api/getUserModels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUser.id }),
      });
      setSavedModels(await res.json());
    };

    updateActiveUser();
    getUserModels();
  }, []);

  useEffect(() => {
    if (!openDescID) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
        setOpenDescID(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDescID]);

  const handleExit = async () => {
    if (!chosenModelID){
      setActiveModels(false);
      return
    }
    const res = await fetch("/api/setUserModel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser.id, modelID: chosenModelID }),
    });
    const resp = await res.json();
    if (resp.message === "exito") setActiveModels(false);
  };

  const crearModelo = async (label: string) => {
    setNombrar(false);
    setLoading(label);

    const res = await fetch("/api/getSavedDocuments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: activeUser.id }),
    });
    const docs = await res.json();
    const samples = docs.map((d: any) => d.content).filter(Boolean);

    if (samples.length === 0) {
      setNotSamples(true);
      setLoading("");
      return;
    }

    await fetch("/api/createUserStyle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: activeUser.id,
        samples: samples.join("\n\n --- \n\n"),
        label,
      }),
    });

    const modelsRes = await fetch("/api/getUserModels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser.id }),
    });
    setSavedModels(await modelsRes.json());
    setNombreDeLaVersion("");
    setLoading("");
  };

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  const handleDeleteModel = async (modelID: string) => {
    const data = await fetch("/api/deleteModel", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelID }),
    });
    setActiveModels(false);
  };

  return (
    <div
      className={`h-full ${
        activeModels ? "w-full sm:w-140" : "w-0"
      } transition-all duration-1000 absolute top-0 left-0 bg-[#211c1f] z-100 border-l border-[#7D7D81] shadow-2xl flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[#7d7d8140]">
        <div>
          <h5 className="text-2xl sm:text-3xl text-(--white-color) font-semibold tracking-tight">
            Tus modelos
          </h5>
          <p className="text-[12px] sm:text-[13px] text-[#7D7D81] mt-1 tracking-widest uppercase">
            Modelo:{" "}
            <span className="text-[#A87580] font-medium">{modelName}</span>
          </p>
        </div>

        <button
          onClick={handleExit}
          className="flex items-center gap-2 text-[13px] sm:text-[14px] text-(--white-color) px-3 sm:px-4 py-2 rounded-md bg-[#3d3439] border border-[#7d7d8140] hover:border-[#A87580] hover:bg-[#4a3d42] transition-all duration-200 cursor-pointer"
        >
          Guardar y salir
          <i className="fa-solid fa-chevron-right text-[11px] sm:text-[12px]" />
        </button>
      </div>

      {/* Lista de modelos */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 flex flex-col gap-y-3">
        {savedModels.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 opacity-40 py-20">
            <i className="fa-regular fa-folder-open text-[40px] text-[#A87580]" />
            <p className="text-[15px] text-[#DCD9DE]">Sin modelos guardados</p>
          </div>
        )}

        {savedModels.map((model: any) => {
          const isActive = chosenModelID === model.modelID;
          const isDescOpen = openDescID === model.modelID;
          if (!chosenModelID) setChosenModelID(model.modelID);

          return (
            <div
              key={model.modelID}
              className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 rounded-md border transition-all duration-200 ${
                isActive
                  ? "border-[#A87580] bg-[#a875801f]"
                  : "border-[#7d7d8130] bg-[#a875800d] hover:border-[#7d7d8160]"
              }`}
            >
              <div
                className={`w-1.5 h-8 rounded-full shrink-0 transition-all duration-300 ${
                  isActive ? "bg-[#A87580]" : "bg-[#7d7d8140]"
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="text-[15px] sm:text-[17px] font-semibold text-[#A87580] truncate">
                  {model.label}
                </p>
                <p className="text-[11px] sm:text-[12px] text-[#7D7D81] mt-0.5">
                  {formatDate(model.createdAt)}
                </p>
              </div>

              <button
                className={`w-10 sm:w-13 h-8 rounded-xl hover:bg-[#7D7D81] flex items-center justify-center transition-all border border-[#7d7d8150] ${isActive ? "bg-[#baabb13e] pointer-events-none" : "bg-[#BAABB1]"}`}
                onClick={() => handleDeleteModel(model.modelID)}
              >
                <i className="fa-solid fa-trash text-[13px] text-[#2D272D]" />
              </button>

              <div className="relative shrink-0" ref={isDescOpen ? modalRef : null}>
                <button
                  className="text-[12px] sm:text-[13px] py-1.5 px-3 sm:px-4 rounded-md bg-[#2d272d] border border-[#7d7d8150] hover:border-[#A87580] text-[#DCD9DE] transition-colors cursor-pointer"
                  onClick={() => setOpenDescID(isDescOpen ? null : model.modelID)}
                >
                  Descripción
                </button>

                {isDescOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 sm:w-72 rounded-md bg-[#2a2227] border border-[#A87580] shadow-xl p-4">
                    <div className="absolute -top-1.75 right-5 w-3 h-3 rotate-45 bg-[#2a2227] border-l border-t border-[#A87580]" />
                    <p className="text-[11px] text-[#A87580] font-semibold uppercase tracking-widest mb-2">
                      Descripción
                    </p>
                    <p className="text-[13px] sm:text-[14px] text-[#DCD9DE] leading-relaxed">
                      {model.desc || "Sin descripción disponible."}
                    </p>
                  </div>
                )}
              </div>

              {isActive ? (
                <div className="shrink-0 h-8 w-8 rounded-full bg-[#A87580] flex items-center justify-center mx-1 sm:mx-3">
                  <i className="fa-solid fa-check text-[#DCD9DE] text-[13px]" />
                </div>
              ) : (
                <button
                  className="shrink-0 text-[12px] sm:text-[13px] py-1.5 px-3 sm:px-4 rounded-md bg-[#a87580ac] text-[#dcd9deac] border border-transparent hover:border-[#A87580] hover:text-[#DCD9DE] transition-all cursor-pointer"
                  onClick={() => setChosenModelID(model.modelID)}
                >
                  Usar
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="w-full flex items-center gap-4 px-5 py-3 rounded-md border border-[#7d7d8130] bg-[#a875800d]">
            <div className="w-1.5 h-8 rounded-full bg-[#7d7d8140] shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-semibold text-[#A87580] truncate">{loading}</p>
              <p className="text-[12px] text-[#7D7D81] mt-0.5">Generando modelo…</p>
            </div>
            <i className="fa-solid fa-hourglass-start text-[#A87580] animate-pulse" />
          </div>
        )}

        {notSamples && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-[#A87580] bg-[#a875801a] text-[#DCD9DE] text-[14px]">
            <i className="fa-solid fa-triangle-exclamation text-[#A87580]" />
            No tienes documentos guardados para generar un modelo.
          </div>
        )}
      </div>

      {/* Footer: crear modelo */}
      <div className="shrink-0 border-t border-[#7d7d8140] px-5 sm:px-8 py-5">
        <button
          disabled={!!loading}
          onClick={() => setNombrar(!nombrar)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md border text-[14px] sm:text-[15px] text-(--white-color) transition-all duration-200 ${
            loading
              ? "opacity-40 cursor-not-allowed border-[#7d7d8130]"
              : "border-[#7d7d8150] bg-[#a875800d] hover:bg-[#a875801f] hover:border-[#A87580] cursor-pointer"
          }`}
        >
          <i className={`fa-solid ${nombrar ? "fa-minus" : "fa-plus"} text-[#A87580]`} />
          Crear nuevo modelo
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            nombrar ? "max-h-24 mt-3 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="text-[14px] sm:text-[16px] text-[#DCD9DE] font-medium whitespace-nowrap">
                {modelName}
              </span>
              <input
                className="w-full outline-none px-2 py-1 bg-transparent border-b border-[#A87580] text-[#b481a6] text-[14px] sm:text-[16px] placeholder:text-[#7D7D81]"
                type="text"
                placeholder="Ejemplo: v.1.1"
                value={nombreDeLaVersion}
                onChange={(e) => setNombreDeLaVersion(e.target.value)}
              />
            </div>
            <button
              disabled={nombreDeLaVersion === ""}
              onClick={() => crearModelo(nombreDeLaVersion)}
              className={`text-[13px] sm:text-[14px] py-1.5 px-4 sm:px-5 rounded-md bg-[#A87580] text-(--white-color) transition-all duration-200 whitespace-nowrap ${
                nombreDeLaVersion === ""
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:px-8 cursor-pointer"
              }`}
            >
              Crear <i className="fa-solid fa-plus ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}