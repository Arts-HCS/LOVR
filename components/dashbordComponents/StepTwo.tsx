import { useEffect, useState } from "react";

function StepTwo({ onNext, onBack, activeUser, setStep, stepFourCompleted }: { onNext: () => void, onBack: () => void, activeUser: any, setStep: (step: number) => void, stepFourCompleted: boolean }) {

  const [modelName, setModelName] = useState("");

  useEffect(() => {
    if (activeUser.modelName) {
      setModelName(activeUser.modelName);
    }
  }, []);

  const [modelError, setModelError] = useState(0);

  const prohibited = ["@", "#", "$", "%", "&", "/", " ", "-"];

  const isProhibited = (text: string) => {
    for (let i of prohibited) {
      if (text.includes(i)) return true;
    }
    return false;
  };

  const handleContinue = async () => {
    if (modelName.trim() === "") {
      setModelError(1);
      return;
    } else if (modelName.length < 3) {
      setModelError(2);
      return;
    } else if (isProhibited(modelName)) {
      setModelError(3);
      return;
    }

    const resp = await fetch("/api/modelNameWrite", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelName: modelName.trim(), userID: activeUser.id }),
    });
    const data = await resp.json();

    if (data.message === "exito") {
      onNext();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start mt-5 p-4 overflow-y-auto">
      <h3 className="text-2xl sm:text-3xl font-medium text-(--white-color) mb-7">Versión 0.1</h3>

      <form className="w-full h-full flex flex-col items-start justify-start gap-3">
        <label className="text-[16px] sm:text-[17px]" htmlFor="LOVRName">Nombra a tu LOVR</label>
        <div className="w-full h-fit flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            placeholder="No utilices acentos, espacios ni caracteres especiales (@#$%&/)."
            id="LOVRName"
            required
            onChange={(e) => {
              setModelName(e.target.value);
              setModelError(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleContinue();
              }
            }}
            value={modelName}
            className="w-full sm:w-[70%] outline-none p-2 text-[15px] sm:text-[15px] border-l border-b border-[#AA747F] shadow-[-8px_6px_10px_rgba(0,0,0,0.2)] rounded"
            type="text"
          />
          <span className={`text-[14px] sm:text-[15px] rounded text-(--white-color) bg-[#4F4346] ${modelError === 0 ? "p-0" : "p-3"}`}>
            {modelError === 1 ? "Ingresa un nombre para continuar" : modelError === 2 ? "El nombre debe tener al menos 3 caracteres" : modelError === 3 ? "No se permiten carácteres especiales" : ""}
          </span>
        </div>

        <p className="text-[15px] sm:text-[17px] text-[#bebebe] w-full sm:w-full mt-4">
          Tu modelo de LOVR necesita conocer tu estilo de escritura para comenzar a aprender de él. <br /> Puedes decidir entre compartir textos que hayas escrito antes, escribir uno corto en este momento, o hacer ambas cosas. Entre más compartas tu estilo, más rápido aprenderá tu LOVR. Si estás {activeUser.gender === "M" ? "lista" : "listo"} para hacerlo, continúa presionando el botón de "Iniciar configuración".
        </p>

        {!stepFourCompleted ? (
          <button
            className="w-45 h-10 bg-[#bbb8b9] text-(--black-color) text-[16px] sm:text-[17px] font-medium rounded flex items-center justify-center mt-2 hover:scale-95 transition-all cursor-pointer"
            onClick={() => setStep(4)}
          >
            Iniciar configuración
          </button>
        ) : (
          <p className="text-[16px] sm:text-[18px] py-1 px-2 rounded-sm bg-[#4F3A3F] shadow-2xs">
            La configuración ha sido guardada
          </p>
        )}

        <p className={`text-[15px] sm:text-[17px] text-[#bebebe] w-full sm:w-full ${stepFourCompleted ? "mt-3" : "mt-14"}`}>
          Si no te sientes {activeUser.gender === "M" ? "lista" : "listo"} en este momento para escribir ni compartir textos, ¡no hay problema! Puedes continuar con la configuración por defecto y explorar el menú principal de LOVR, ¡ahí podrás personalizarlo cuando lo desees!
        </p>
      </form>

      <div className="w-full mt-auto flex items-center justify-end gap-3 sm:gap-5 pt-4">
        <button
          className="w-32 sm:w-40 h-10 text-(--white-color) bg-[#4f4346] cursor-pointer rounded flex items-center justify-center mt-5 hover:scale-95 transition-all"
          onClick={() => onBack()}
        >
          Regresar
        </button>
        <button
          onClick={() => handleContinue()}
          className="w-32 sm:w-40 h-10 bg-[#9d7880] text-(--white-color) rounded flex items-center justify-center mt-5 hover:scale-95 transition-all cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default StepTwo;