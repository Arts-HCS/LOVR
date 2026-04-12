import ExportGroup from "../utils/exportButtons";
import { useEffect, useState } from "react";

export default function GeneratedTaskView({
  viewedTask,
  setViewedTask,
  activeUser,
}: {
  viewedTask: any;
  setViewedTask: any;
  activeUser: any;
}) {
  let { id, title, status, generated } = viewedTask;

  const [lovrVersion, setLovrVersion] = useState("");
  const [generatedTask, setGeneratedTask] = useState("");
  const [slidesVersion, setSlidesVersion] = useState(null);
  const [versionActual, setVersionActual] = useState(0);

  const generateLOVRVersion = async () => {
    const resp = await fetch("/api/generateLovrVersion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser.id, generated }),
    });
    const data = await resp.json();
    setLovrVersion(data.result);

    await fetch("/api/saveLovrGenerated", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseID: id, lovrGenerated: data.result }),
    });
  };

  const generateSlidesVersion = async () => {
    const resp = await fetch("/api/generateTaskSlides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, generated, nombre: activeUser.name }),
    });
    const slidesJSON = await resp.json();
    setSlidesVersion(slidesJSON.slides);

    await fetch("/api/saveSlidesGenerated", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseID: id, slidesGenerated: slidesJSON.slides }),
    });
  };

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
  }, [id, generated]);

  return (
    <div className="flex-1 min-w-0 h-full bg-[#F0F4F9] border-l border-t border-[#3B3440] flex flex-col overflow-hidden">

      <div className="text-[18px] sm:text-[22px] bg-[#d1d9e8] h-12 text-[#1f1f1e] border-b border-[#3A3F41] flex items-center justify-between px-4 sm:px-6 shrink-0 w-full">
        <span className="truncate">{title}</span>
        <button
          className="ml-3 shrink-0 text-[#1f1f1e] p-1 cursor-pointer"
          onClick={() => setViewedTask(null)}
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        <textarea
          className="flex-1 min-h-0 bg-[#FFFFFF] outline-none border-0 border-r border-[#3A3E41] text-left resize-none pt-8 sm:pt-16 px-4 sm:px-12 text-[#1d1d1d] text-[14px] sm:text-[15.5px] font-normal shadow-[inset_0_4px_30px_rgba(0,0,0,0.05)] pb-8 w-full"
          id="generatedAnswer"
          value={generatedTask}
          readOnly
        />

        <div className="shrink-0 w-full lg:w-56 xl:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden border-t lg:border-t-0 lg:border-l border-[#3A3E41]">

          {/* Exportar */}
          <div className="p-4 bg-[#c8cfdc] flex flex-col items-start justify-start shrink-0 lg:w-full min-w-[160px]">
            <h4 className="text-base sm:text-xl text-[#1D1D1D] mb-3 font-normal">Exportar</h4>
            <ExportGroup
              title={title}
              content={generatedTask}
              slidesContent={slidesVersion}
              slidesVersion={slidesVersion}
              activeUser={activeUser}
            />
          </div>

          {/* Versiones */}
          <div className="p-4 bg-[#2B2E43] flex flex-col gap-y-3 items-start justify-start shrink-0 lg:w-full min-w-[160px]">
            <h4 className="text-base sm:text-xl text-[#DCD9DE] font-normal">Versiones</h4>

            <button
              disabled={!lovrVersion}
              className={`text-[14px] sm:text-[17px] text-left font-medium p-2 border border-[#7D7D81] rounded w-full transition-all
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
              className={`text-[14px] sm:text-[17px] text-left font-medium p-2 border border-[#7D7D81] rounded w-full transition-all cursor-pointer text-[#2B2E43] bg-[#DCD9DE]
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