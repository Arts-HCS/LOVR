import { useEffect, useState } from "react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];

      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TaskContext({
  task,
  tasksAnswers,
  setTasksAnswers,
  setTasksGeneradas,
  setSelectedTask,
  setSavedTasks,
  IDsGenerados,
}: {
  task: any;
  tasksAnswers: any;
  setTasksAnswers: (value: any) => void;
  setTasksGeneradas: (value: any) => void;
  setSelectedTask: (value: any) => void;
  setSavedTasks: (value: any) => void;
  IDsGenerados: number[];
}) {
  let receivedID = null;
  if (task.baseID) {
    receivedID = task.baseID;
  } else receivedID = task.id;

  if (IDsGenerados.includes(receivedID)) return;

  // Opciones de 0 a 4
  const { opciones } = task.context;

  const [taskMenu, setTaskMenu] = useState<any>(null);
  const [taskSelected, setTaskSelected] = useState<any>(null);

  const [opcionesElegidas, setOpcionesElegidas] = useState<number[]>([]);

  useEffect(() => {
    setOpcionesElegidas([]);
  }, [opciones]);

  // CAMBIO: Ahora manejamos un arreglo de archivos
  const [files, setFiles] = useState<File[]>([]);

  // Generated Answer
  const handleSelectTask = (id: string) => {
    if (id === "matiz") {
      setTaskMenu("matiz");
      setTaskSelected(6);
      return;
    }
    let numberId = parseInt(id);

    setTaskSelected(numberId);

    let taskCampos = opciones[numberId - 1].campos;
    setTaskMenu(taskCampos);
  };

  const handleSaveTask = () => {
    // CAMBIO: Validamos contra el length de files
    if (opcionesElegidas.length === 0 && files.length === 0) {
      setOpcionesElegidas((prev: number[]) => [...prev, 1, 2, 3, 4, 5, 6]);
      return;
    }

    let sortedOpcionesElegidas = opcionesElegidas.sort(
      (a: number, b: number) => a - b
    );

    const respuestas: string[] = [];
    respuestas.push(`Nombre de la tarea: ${task.title}. `);

    const respuestasPorOpcion = tasksAnswers[receivedID];

    let nombresDeOpciones = opciones.map((op: any) => op.titulo);
    let camposPorOpcion = opciones.map((op: any) => op.campos);

    for (let i of sortedOpcionesElegidas) {
      let respuesta = "";

      if (i === 6) {
        const data = respuestasPorOpcion[i] || {};
        const instructions = data.thirdInput || "";
        const body = data.fourthInput || "";

        respuesta += `Instrucciones: ${
          instructions.length > 3 ? instructions : "Sin instrucciones"
        }. `;
        respuesta += `\nCuerpo: ${
          body.length > 3 ? body : "Sin cuerpo"
        }. `;
      } else {
        respuesta += `Aspecto: ${nombresDeOpciones[i - 1]}. `;

        const currentResp = respuestasPorOpcion?.[i] || {};
        const firstInput = currentResp.firstInput || "";
        const secondInput = currentResp.secondInput || "";
        const thirdInput = currentResp.thirdInput || "";
        const fourthInput = currentResp.fourthInput || "";

        if (camposPorOpcion[i - 1].length === 1) {
          respuesta += `Pregunta sugerida: "${
            camposPorOpcion[i - 1][0]
          }. Respuesta: ${
            firstInput.length > 2 ? firstInput : "Sin respuesta"
          }. `;
        } else {
          respuesta += `Pregunta sugerida 1: "${
            camposPorOpcion[i - 1][0]
          }. Respuesta: ${
            firstInput.length > 2 ? firstInput : "Sin respuesta"
          }. `;
          respuesta += `Pregunta sugerida 2: "${
            camposPorOpcion[i - 1][1]
          }. Respuesta: ${
            secondInput.length > 2 ? secondInput : "Sin respuesta"
          }. `;
        }

        respuesta += `Instrucciones: ${
          thirdInput.length > 2 ? thirdInput : "Sin instrucciones"
        }. `;
        respuesta += `Cuerpo: ${
          fourthInput.length > 2 ? fourthInput : "Sin cuerpo"
        }. `;
      }

      respuestas.push(respuesta);
    }

    let prompt = respuestas.join(" \n");
    console.log(prompt);

    const generateAnswer = async (prompt: string) => {
      setTasksGeneradas((prev: any) => [
        ...prev,
        {
          id: receivedID,
          status: 0,
          title: task.title,
          generated: "",
        },
      ]);
      
      // CAMBIO: Convertimos todos los archivos a base64
      let base64Array: string[] = [];
      if (files.length > 0) {
        base64Array = await Promise.all(files.map((file) => fileToBase64(file)));
      }

      const responseGenerate = await fetch("/api/generateTaskContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          images: base64Array, // CAMBIO: Enviamos 'images' (arreglo) en vez de 'image' (string)
        }),
      });
      const dataGenerated = await responseGenerate.json();
      const { answer } = dataGenerated;

      setTasksGeneradas((prev: any) => {
        return prev.map((task: any) =>
          task.id === receivedID
            ? {
                ...task,
                status: 1,
                generated: answer,
              }
            : task
        );
      });

      const controller = new AbortController();

      const saveResponse = await fetch("/api/saveGenerated", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseID: receivedID,
          generated: answer,
        }),
      });
      const finalresp = await saveResponse.json();
    };

    setSelectedTask(null);

    generateAnswer(prompt);
  };

  return (
    <div className="w-[50%] rounded-xl mr-2 flex flex-col items-start justify-start overflow-scroll h-158 pr-8 pb-40">
      <div className="bg-[#46343c90] pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex flex-col w-full h-fit rounded-2xl">
        <h5 className="w-full text-[19px] h-fit font-medium text-[#c2939dc0] p-2.5 border-[#a9737f9a] border text-center bg-[#523a44c7] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
          {task.title}
        </h5>
        <div className="w-full h-fit flex flex-col items-start justify-start pt-4 px-3 gap-2">
          {opciones.map((option: any, index: number) => {
            return (
              <div
                key={index}
                className="w-full flex items-center justify-start h-fit gap-x-2"
              >
                <button
                  key={index}
                  onClick={() => {
                    if (taskSelected != option.id) {
                      handleSelectTask(option.id);
                    } else {
                      setTaskMenu(null);
                      setTaskSelected(null);
                    }
                    if (
                      !opcionesElegidas.includes(parseInt(option.id)) &&
                      !(taskSelected === option.id)
                    ) {
                      setOpcionesElegidas((prev) => [
                        ...prev,
                        parseInt(option.id),
                      ]);
                    } else {
                      setOpcionesElegidas((prev) =>
                        prev.filter((id: number) => id != option.id)
                      );
                    }
                  }}
                  className={`w-[88%] p-2 rounded-xl hover:bg-[#523a44d7] hover:text-[#c2939dde] ${
                    taskSelected == option.id
                      ? "bg-[#523a44d7] text-[#c2939dde]"
                      : ""
                  } transition-all duration-300 hover:shadow-[0_4px_30px_rgba(0,0,0,0.15)] cursor-pointer text-[17px] text-(--white-color) text-left`}
                >
                  {option.titulo}
                </button>
                <button
                  className={`transition-all h-10 w-11 flex items-center justify-center text-[18px] transform cursor-pointer rounded-xl hover:bg-[#262225] ${
                    opcionesElegidas.includes(parseInt(option.id))
                      ? "transform scale-110 bg-[#262225] text-[#B28791]"
                      : "bg-[#2b262abf] text-[#d7d5d9e1]"
                  }`}
                  onClick={() => {
                    if (!opcionesElegidas.includes(parseInt(option.id))) {
                      setOpcionesElegidas((prev) => [
                        ...prev,
                        parseInt(option.id),
                      ]);
                    } else {
                      setOpcionesElegidas((prev) =>
                        prev.filter((id: number) => id != option.id)
                      );
                    }
                  }}
                >
                  <i key={index} className="fa-solid fa-tags"></i>
                </button>
              </div>
            );
          })}
          <div className="w-full flex items-center justify-start h-fit gap-x-2">
            <button
              onClick={() => {
                if (taskSelected != 6) {
                  handleSelectTask("matiz");
                } else {
                  setTaskMenu(null);
                  setTaskSelected(null);
                }

                if (!opcionesElegidas.includes(6) && !(taskSelected === 6)) {
                  setOpcionesElegidas((prev) => [...prev, 6]);
                } else {
                  setOpcionesElegidas((prev) =>
                    prev.filter((id: number) => id != 6)
                  );
                }
              }}
              className={` w-[88%] p-2 rounded-xl ${
                taskSelected === 6
                  ? "bg-[#6f468274] text-[#e2d1d5de] shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
                  : "bg-[#eceaeccd] hover:bg-[#704c8081] hover:text-[#e2d1d5de]"
              }   transition-all duration-200 hover:shadow-[0_4px_30px_rgba(0,0,0,0.15)] cursor-pointer text-[17px] text-(--black-color) text-left`}
            >
              Personalizado
            </button>
            <button
              className={`transition-all h-10 w-11 flex items-center justify-center text-[18px] transform cursor-pointer rounded-xl hover:bg-[#262225] ${
                opcionesElegidas.includes(6)
                  ? "transform scale-110 bg-[#262225] text-[#B28791]"
                  : "bg-[#2b262abf] text-[#d7d5d9e1]"
              }`}
              onClick={() => {
                if (!opcionesElegidas.includes(6)) {
                  setOpcionesElegidas((prev) => [...prev, 6]);
                } else {
                  setOpcionesElegidas((prev) =>
                    prev.filter((id: number) => id !== 6)
                  );
                }
              }}
            >
              <i className="fa-solid fa-tags"></i>
            </button>
          </div>
        </div>
      </div>

      {taskMenu && taskMenu !== "matiz" && (
        <div className="w-full h-fit p-4 rounded-xl border border-[#a9737f4b] bg-[#46343c5b] mt-5">
          <form className="w-full h-full">
            {taskMenu.map((campo: any, index: number) => {
              return (
                <div key={index} className="flex flex-col w-full h-fit mb-3">
                  <label className="text-[16.5px] mb-2" htmlFor={`${index}`}>
                    {campo}
                  </label>
                  <textarea
                    className="outline-none border border-[#a9737f4b] rounded-lg p-2 bg-[#211c1f65] resize-none text-[#dbd9ddde] h-15 focus:h-25 hover:h-18 transition-all duration-350"
                    placeholder="Responde..."
                    value={
                      index === 0
                        ? tasksAnswers[receivedID]?.[taskSelected]?.firstInput
                        : tasksAnswers[receivedID]?.[taskSelected]?.secondInput
                    }
                    onChange={(e) => {
                      const field = index === 0 ? "firstInput" : "secondInput";

                      setTasksAnswers((prev: any) => ({
                        ...prev,
                        [receivedID]: {
                          ...prev[receivedID],
                          [taskSelected]: {
                            ...prev[receivedID]?.[taskSelected],
                            [field]: e.target.value,
                          },
                        },
                      }));
                    }}
                  />
                </div>
              );
            })}
          </form>
        </div>
      )}
      {taskMenu && (
        <form className="w-full h-fit p-4 rounded-xl border border-[#7d7d8184]  lovr-background mt-5 shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
          <label className="text-[16.5px]" htmlFor="instructions">
            Instrucciones
          </label>
          <textarea
            id="instructions"
            placeholder="Cuantas sean necesarias..."
            className="mt-1 w-full h-18 outline-none border border-[#efecec2c] text-[#dbd9ddde] text-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.15)] rounded-lg p-2 bg-[#1c1e2185] resize-none mb-4 focus:h-40 hover:h-22 transition-all duration-350 "
            value={tasksAnswers[receivedID]?.[taskSelected]?.thirdInput || ""}
            onChange={(e) => {
              setTasksAnswers((prev: any) => {
                const currentTaskGroup = prev[receivedID] || {};
                const currentSelection = currentTaskGroup[taskSelected] || {};

                return {
                  ...prev,
                  [receivedID]: {
                    ...currentTaskGroup,
                    [taskSelected]: {
                      ...currentSelection,
                      thirdInput: e.target.value,
                    },
                  },
                };
              });
            }}
          ></textarea>
          <label className="text-[16.5px]" htmlFor="body">
            Contexto
          </label>
          <textarea
            className="mt-1 w-full h-20 outline-none border border-[#efecec2c] text-[#dbd9ddde] text-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.15)] rounded-lg p-2 bg-[#1c1e2185] resize-none focus:h-45 hover:h-24 transition-all duration-350"
            name="body"
            id="body"
            placeholder="Ingresa tu información..."
            value={tasksAnswers[receivedID]?.[taskSelected]?.fourthInput || ""}
            onChange={(e) => {
              setTasksAnswers((prev: any) => ({
                ...prev,
                [receivedID]: {
                  ...prev[receivedID],
                  [taskSelected]: {
                    ...prev[receivedID][taskSelected],
                    fourthInput: e.target.value,
                  },
                },
              }));
            }}
          ></textarea>
        </form>
      )}
      <div>
        <form className="w-full p-4 rounded-2xl bg-[#2D272C] mt-3">
          <label
            htmlFor="file"
            className="text-[18.5px] font-medium cursor-pointer"
          >
            Adjuntar foto(s)
          </label>
          {/* CAMBIO: Se agregó "multiple" y se modificó el onChange para aceptar múltiples archivos */}
          <input
            className="cursor-pointer mt-2 p-2 border border-[#a9737f4b] rounded-lg text-[#dbd9ddde] bg-[#211c1f65] w-full"
            type="file"
            id="file"
            multiple // Permite seleccionar múltiples archivos
            accept="image/png, image/jpeg, image/gif, image/jpg, image/webp"
            onChange={(e) => {
              if (e.target.files) {
                // Convertimos el FileList a un arreglo tradicional de JavaScript
                setFiles(Array.from(e.target.files));
              }
            }}
          />
          {/* Opcional: Mostrar la cantidad de imágenes seleccionadas */}
          {files.length > 0 && (
            <p className="text-sm mt-2 text-[#dbd9ddde]">
              {files.length} imagen(es) seleccionada(s)
            </p>
          )}
        </form>
      </div>

      <div className="w-full h-fit flex items-start justify-start mt-5 gap-3">
        <button
          className="w-[85%] min-h-10 text-(--black-color) bg-[#C7C4C8] cursor-pointer rounded flex items-center justify-center hover:scale-95 transition-all text-[17px]"
          onClick={() => handleSaveTask()}
        >
          {/* CAMBIO: Ajuste de la lógica de los botones para el arreglo "files" */}
          {opcionesElegidas.length === 0 && files.length === 0 
            ? "Agregar todas las opciones"
            : opcionesElegidas.length === 0 && files.length > 0
            ? "Subir contenido"
            : opcionesElegidas.length >= 1 && "Resolver"}
          <i className="fa-solid fa-arrow-up transfrom rotate-45 ml-1"></i>
        </button>

        <button
          className={`min-h-10 text-(--black-color) w-[15%] ${
            opcionesElegidas.length === 0
              ? "bg-[#c7c4c869] scale-90 pointer-events-none"
              : ""
          } bg-[#C7C4C8] cursor-pointer rounded flex items-center justify-center hover:scale-95 transition-all text-[17px]`}
          onClick={() => {
            setOpcionesElegidas([]);
          }}
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  );
}