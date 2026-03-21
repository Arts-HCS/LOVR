import { useEffect, useState } from "react";

export default function Documents({
  setActiveDocuments,
  activeDocuments,
  activeUser,
}: {
  setActiveDocuments: (value: boolean) => void;
  activeDocuments: boolean;
  activeUser: any;
}) {
  const [newDocs, setNewDocs] = useState<any>([{ id: Date.now(), content: "" }]);

  useEffect(() => {
    const last = newDocs[newDocs.length - 1];
    if (last && last.content.length > 5) {
      setNewDocs([...newDocs, { id: Date.now(), content: "" }]);
    }
  }, [newDocs]);

  const [respDocs, setRespDocs] = useState<any>([]);

  const getDocs = async () => {
    const data = await fetch("/api/getSavedDocuments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: activeUser.id }),
    });
    return await data.json();
  };

  useEffect(() => {
    getDocs().then((data) => setRespDocs(data));
  }, []);

  const saveDocuments = async () => {
    const allowedDocs = newDocs
      .filter((doc: any) => doc.content.split(" ").length > 100)
      .map((doc: any) => doc.content.trim());

    await fetch("/api/docSend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: activeUser.id, content: allowedDocs }),
    });
  };

  const deleteDocument = async (e: any, id: number) => {
    e.preventDefault();
    await fetch("/api/deleteDocument", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: activeUser.id, id }),
    });
    setActiveDocuments(false);
  };

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div
      className={`h-full ${
        activeDocuments ? "w-140" : "w-0"
      } transition-all duration-1000 absolute top-0 right-0 bg-[#211c1f] z-100 border-l border-[#7D7D81] shadow-2xl flex flex-col overflow-hidden`}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 pt-8 pb-5 border-b border-[#7d7d8140]">
        <div>
          <h5 className="text-3xl text-(--white-color) font-semibold tracking-tight">
            Tus documentos
          </h5>
          <p className="text-[13px] text-[#7D7D81] mt-1 tracking-widest uppercase">
            Muestras de escritura guardadas
          </p>
        </div>

        <button
          onClick={() => {
            saveDocuments();
            setActiveDocuments(false);
          }}
          className="flex items-center gap-2 text-[14px] text-(--white-color) px-4 py-2 rounded-md bg-[#3d3439] border border-[#7d7d8140] hover:border-[#A87580] hover:bg-[#4a3d42] transition-all duration-200 cursor-pointer"
        >
          Guardar y salir
          <i className="fa-solid fa-chevron-right text-[12px]" />
        </button>
      </div>

      {/* ── Contenido scrolleable ── */}
      <div className="flex-1 overflow-y-auto px-8 py-5 flex flex-col">

        {/* Documentos guardados */}
        {respDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 opacity-40 py-12">
            <i className="fa-regular fa-folder-open text-[40px] text-[#A87580]" />
            <p className="text-[15px] text-[#DCD9DE]">No tienes documentos guardados</p>
          </div>
        ) : (
          <form className="flex flex-col gap-y-5">
            {respDocs.map((doc: any, index: number) => (
              <div
                key={index}
                className="w-full flex flex-col rounded-md border border-[#7d7d8130] bg-[#a875800d] hover:border-[#7d7d8160] transition-all duration-200 px-5 py-4 gap-2"
              >
                <div className="flex items-center justify-between">
                  <label
                    className="text-[13px] text-[#A87580] font-semibold uppercase tracking-widest"
                    htmlFor={doc.id}
                  >
                    Documento {index + 1}
                  </label>
                  {doc.createdAt && (
                    <span className="text-[12px] text-[#7D7D81]">
                      {formatDate(doc.createdAt)}
                    </span>
                  )}
                </div>

                <textarea
                  id={doc.id}
                  readOnly
                  onChange={(e) =>
                    setRespDocs(
                      respDocs.map((docR: any) =>
                        doc.id === docR.id ? { ...docR, content: e.target.value } : docR
                      )
                    )
                  }
                  value={doc.content}
                  className="w-full h-24 rounded-md border border-[#7d7d8150] text-[#BEBEBE] bg-[#2a2227] resize-none p-3 text-justify outline-none focus:border-[#A87580] focus:border-2 hover:h-36 focus:h-72 transition-all duration-300 text-[14px] leading-relaxed"
                />

                <button
                  className="self-start flex items-center gap-2 text-[13px] py-1.5 px-4 rounded-md bg-[#3d3439] border border-[#7d7d8140] hover:border-[#A87580] text-[#DCD9DE] transition-all duration-200 cursor-pointer"
                  onClick={(e) => deleteDocument(e, doc.id)}
                >
                  Eliminar documento
                  <i className="fa-solid fa-file-circle-minus text-[#A87580]" />
                </button>
              </div>
            ))}
          </form>
        )}

        {/* Agregar documentos */}
        <div className="mt-10 mb-2">
          <h5 className="text-2xl text-(--white-color) font-semibold tracking-tight">
            Agregar documentos
          </h5>
          <p className="text-[13px] text-[#7D7D81] mt-1">
            Los documentos deben contener al menos 100 palabras y no ser demasiado parecidos entre sí.
          </p>
        </div>

        <form className="flex flex-col gap-y-4">
          {newDocs.map((newD: any, index: number) => (
            <div
              key={index}
              className="w-full flex flex-col rounded-md border border-[#7d7d8130] bg-[#a875800d] hover:border-[#7d7d8160] transition-all duration-200 px-5 py-4 gap-2"
            >
              <label
                className="text-[13px] text-[#A87580] font-semibold uppercase tracking-widest"
                htmlFor={newD.id}
              >
                Documento {index + 1}
              </label>
              <textarea
                id={newD.id}
                onChange={(e) =>
                  setNewDocs(
                    newDocs.map((docR: any) =>
                      newD.id === docR.id ? { ...docR, content: e.target.value } : docR
                    )
                  )
                }
                value={newD.content}
                className="w-full h-20 rounded-md border border-[#7d7d8150] text-[#BEBEBE] bg-transparent resize-none p-3 text-justify outline-none focus:border-[#A87580] focus:border-2 hover:h-28 focus:h-72 focus:bg-[#262224] transition-all duration-300 text-[14px] leading-relaxed"
              />
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}