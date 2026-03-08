import { get } from "http";
import { useEffect } from "react";
import { useState } from "react";

export default function Documents({
  setActiveDocuments,
  activeDocuments,
  activeUser,
}: {
  setActiveDocuments: (value: boolean) => void;
  activeDocuments: boolean;
  activeUser: any;
}) {

    const [newDocs, setNewDocs] = useState<any>([
        {
            id: Date.now(),
            content: ""
        }
    ]);

    useEffect(()=>{
        const last = newDocs[newDocs.length -1]
        if (last && last.content.length > 5){
            setNewDocs(
                [...newDocs, {
                    id: Date.now(),
                    content: ""
                }]
            )
        }

    }, [newDocs])

  const [respDocs, setRespDocs] = useState<any>([]);

  const getDocs = async () => {
    const data = await fetch("/api/getSavedDocuments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: activeUser.id,
      }),
    });
    const resp = await data.json();
    return resp;
  };

  useEffect(() => {
    const docs = getDocs();
    docs.then((data) => {
      setRespDocs(data);
    });
  }, []);


    //   FUNCIONES PARA GUARDAR LOS DOCUMENTOS

    const saveDocuments = async () => {
        const allowedDocs = newDocs.filter((doc:any)=> doc.content.split(" ").length > 100).map((doc:any) => doc.content)


        const data = await fetch("/api/docSend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userID: activeUser.id,
                content: allowedDocs
            })
        })
        const resp = await data.json()
    }

  return (
    <div
      className={`h-full ${
        activeDocuments ? "w-140" : "w-0"
      } transition-all duration-1000 absolute top-0 right-0 bg-[#211c1f] z-100 border-l border-[#7D7D81] shadow-2xl p-8 flex flex-col items-tart justify-start  overflow-scroll`}
    >
      <button
        onClick={() =>{
            saveDocuments()
            setActiveDocuments(false)
        }}
        className="absolute top-3 right-3 w-fit px-2 text-[17px] rounded h-9 flex items-center justify-center bg-[#3d3439] cursor-pointer"
      >
        Guardar y salir
        <i className="fa-solid fa-chevron-right text-(--white-color)"></i>
      </button>
      <h5 className="text-3xl text-(--white-color) mb-3">Tus documentos</h5>
      {respDocs.length === 0 && (
        <p className="text-[#bebebe] text-xl">No tienes documentos guardados</p>
      )}
      {respDocs.length > 0 && (
        <form className="mt-2 flex flex-col items-start justify-start">
          {respDocs.map((doc: any, index: number) => {
            return (
              <div className="w-full h-full flex flex-col items-start justify-start" key={index}>
                <label className="text-[#BEBEBE]" htmlFor={doc.id}>
                  Documento {index + 1}
                </label>
                <textarea
                  id={doc.id}
                  readOnly
                  onChange={(e) =>
                    setRespDocs(
                      respDocs.map((docR: any) =>
                        doc.id === docR.id
                          ? { ...docR, content: e.target.value }
                          : docR
                      )
                    )
                  }
                  value={doc.content}
                  className="w-full h-30 rounded border border-[#7D7D81] text-[#BEBEBE] shadow-2xs resize-none p-2 text-justify mt-3 mb-1 outline-none focus:border-[#9d7880] focus:border-2 hover:h-40 focus:h-78 transition-all duration-300"
                />
                {doc.createdAt && (
                    <p className="ml-auto text-[#bebebe] text-[16px]">
                    {doc.createdAt.split("T")[0].split("-")[2]}/
                    {doc.createdAt.split("T")[0].split("-")[1]}/
                    {doc.createdAt.split("T")[0].split("-")[0]}
                  </p>
                )}
                
              </div>
            );
          })}
        </form>
      )}

    <h5 className="text-2xl text-(--white-color) mt-10 mb-2">Agregar documentos</h5>
    <p className="text-[#bebebe] text-[16px]">Los documentos deben contener al menos 100 palabras y no ser demsasiado parecidos entre sí.</p>
      <form className="mt-2 flex flex-col items-start justify-start gap-6">
        {newDocs.map((newD: any, index: number) => {
          return (
            <div className="w-full h-full flex flex-col items-start justify-start" key={index}>
              <label className="text-[#d9d7d7]" htmlFor={newD.id}>
                Documento {index + 1}
              </label>
              <textarea
                id={newD.id}
                onChange={(e) =>
                  setNewDocs(
                    newDocs.map((docR: any) =>
                      newD.id === docR.id
                        ? { ...docR, content: e.target.value }
                        : docR
                    )
                  )
                }
                value={newD.content}
                className="w-full h-20 rounded border border-[#7D7D81] text-[#BEBEBE] shadow-2xs resize-none p-2 text-justify mt-3 mb-1 outline-none focus:border-[#9d7880] focus:border-2 hover:h-30 focus:h-78 transition-all duration-300 focus:bg-[#262224]"
              />
            </div>
          );
        })}
      </form>
    </div>
  );
}
