import ExportGroup from "../utils/exportButtons";
import { useEffect, useState } from "react";

export default function GeneratedTaskView({
  viewedTask,
  setViewedTask,
  activeUser
}: {
  viewedTask: any;
  setViewedTask: any;
  activeUser: any;
}) {
  // Extraemos las propiedades. Importante: vigilamos 'id' para los cambios.
  let { id, title, status, generated } = viewedTask;

  const [lovrVersion, setLovrVersion] = useState("");
  const [generatedTask, setGeneratedTask] = useState("");
  const [slidesVersion, setSlidesVersion] = useState(null);
  const [versionActual, setVersionActual] = useState(0);

  // --- Funciones de Generación ---
  const generateLOVRVersion = async () => {
    const resp = await fetch("/api/generateLovrVersion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, generated })
    });
    const data = await resp.json();
    setLovrVersion(data.answer);

    await fetch("/api/saveLovrGenerated", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseID: id, lovrGenerated: data.answer })
    });
  };

  const generateSlidesVersion = async () => {
    const resp = await fetch("/api/generateTaskSlides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, generated, nombre: activeUser.name })
    });
    const slidesJSON = await resp.json();
    setSlidesVersion(slidesJSON.slides);

    await fetch("/api/saveSlidesGenerated", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseID: id, slidesGenerated: slidesJSON.slides })
    });
  };

  // --- Efecto Principal (Sincronización) ---
  useEffect(() => {
    setGeneratedTask(generated);
    setLovrVersion(""); 
    setSlidesVersion(null);
    setVersionActual(0);

    const loadTaskData = async () => {
      try {
        const lovrResp = await fetch("/api/getLovrGenerated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const lovrData = await lovrResp.json();
        
        if (lovrData.error) {
          await generateLOVRVersion();
        } else {
          setLovrVersion(lovrData);
        }

        const slidesResp = await fetch("/api/getSlidesGenerated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const slidesData = await slidesResp.json();
        
        if (slidesData.error) {
          await generateSlidesVersion();
        } else {
          setSlidesVersion(slidesData);
        }
      } catch (err) {
        console.error("Error al sincronizar datos de la tarea:", err);
      }
    };

    if (id) {
      loadTaskData();
    }

  }, [id, generated]); // El efecto se dispara cada vez que el ID o el contenido base cambian.


  return (
    <div className="h-full w-full bg-[#F0F4F9] border-l border-t border-[#3B3440] flex flex-col relative items-start justify-start">
      <h4 className="text-[22px] bg-[#d1d9e8] h-12 text-[#1f1f1e] border-b border-[#3A3F41] flex items-center justify-between px-6 shrink-0 w-full">
        {title}
      </h4>

      <div className="flex-1 flex items-start justify-start pt-10 pb-0 pl-7 gap-3 ">
        <textarea
          className="h-full w-[800px] shrink-0 bg-[#FFFFFF] outline-none border text-left border-[#3A3E41] resize-none pt-22 px-18 text-[#1d1d1d] text-[15px] shadow-[0_4px_30px_rgba(0,0,0,0.2)] pb-20 border-b-0"
          id="generatedAnswer"
          value={generatedTask}
          readOnly
        ></textarea>
        
        <div className="h-full flex flex-col gap-y-5">
          <div className="h-fit p-4 bg-[#c8cfdc] shrink-0 flex flex-col items-start justify-start rounded">
            <h4 className="text-xl text-[#1D1D1D] mb-3 font-normal">Exportar</h4>
            <ExportGroup 
              title={title} 
              content={generatedTask} 
              slidesContent={slidesVersion} 
              slidesVersion={slidesVersion}
            />
          </div>

          <div className="h-45 p-4 bg-[#2B2E43] shrink-0 flex flex-col gap-y-3 items-start justify-start rounded">
            <h4 className="text-xl text-[#DCD9DE] font-normal">Versiones</h4>
            
            <button 
              disabled={!lovrVersion}
              className={`text-[17px] text-left font-medium p-2 border border-[#7D7D81] rounded w-full transition-all 
                ${!lovrVersion ? "opacity-50 cursor-not-allowed bg-[#c7c4c9]" : "cursor-pointer bg-white text-[#2B2E43]"}
                ${versionActual === 1 ? "border-2 border-[#454A82] scale-105" : ""}`}
              onClick={() => {
                if (!lovrVersion) return;
                setVersionActual(1);
                setGeneratedTask(lovrVersion);
              }}
            >
              {lovrVersion ? "Versión LOVR" : "Generando LOVR..."}
            </button>

            <button 
              className={`text-[17px] text-left font-medium p-2 border border-[#7D7D81] rounded w-full transition-all cursor-pointer text-[#2B2E43] bg-[#DCD9DE]
                ${versionActual === 0 ? "border-2 border-[#454A82] scale-105" : ""}`}
              onClick={() => {
                setVersionActual(0);
                setGeneratedTask(generated);
              }}
            >
              Versión inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}