import { useEffect, useState } from "react";
import TaskContext from "../taskContextComponents/taskContext";
import GeneratedTaskView from "../taskContextComponents/generatedTaskView";
import { ids } from "googleapis/build/src/apis/ids";

type Props = {
  tasks: any;
  setTasks?: any;
  setActive?: any;
  activeUser?: any;
  savedTasks?: any;
  setSavedTasks?: any;
  setTasksGeneradas?: any;
  tasksGeneradas?: any;
};

function formatearFecha(year: number, month: number, day: number) {
  const fecha = new Date(year, month - 1, day);
  if (isNaN(fecha.getTime())) return "";
  let texto = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function WritingComponent({
  tasks,
  setTasks,
  setActive,
  activeUser,
  savedTasks,
  setSavedTasks,
  setTasksGeneradas,
  tasksGeneradas,
}: Props) {
  const [tasksAnswers, setTasksAnswers] = useState<any>({});
  const [everyTask, setEveryTask] = useState<any>([]);

  useEffect(() => {
    const allowedTasks: any = [];
    tasks.forEach((task: any) => {
      if (task.content !== "") allowedTasks.push(task);
    });
    if (savedTasks.message === "No tasks") return;
    setEveryTask([...allowedTasks, ...savedTasks]);
  }, [tasks, savedTasks]);

  useEffect(() => {
    setTasksAnswers((prev: any) => {
      const updated = { ...prev };
      everyTask.forEach((task: any) => {
        const key = task.createdAt ? task.baseID : task.id;
        updated[key] = {
          1: { firstInput: "", secondInput: "", thirdInput: "", fourthInput: "" },
          2: { firstInput: "", secondInput: "", thirdInput: "", fourthInput: "" },
          3: { firstInput: "", secondInput: "", thirdInput: "", fourthInput: "" },
          4: { firstInput: "", secondInput: "", thirdInput: "", fourthInput: "" },
          5: { firstInput: "", secondInput: "", thirdInput: "", fourthInput: "" },
          6: { firstInput: "", secondInput: "", thirdInput: "", fourthInput: "" },
        };
      });
      return updated;
    });
  }, [everyTask]);

  const handleDeleteSavedTasks = async (baseID: string) => {
    const resp = await fetch("/api/deleteSavedTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseID }),
    });
    const data = await resp.json();
    if (data.message === "exito") {
      if (savedTasks.message === "No tasks") return;
      setSavedTasks((prev: any) =>
        prev.filter((task: any) => task.baseID !== baseID)
      );
    }
    setTasksGeneradas((prev: any) => {
      return prev.filter((task: any) => task.id !== baseID);
    });
  };

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeRightBar, setActiveRightBar] = useState(false);
  const [IDsGenerados, setIDsGenerados] = useState<number[]>([]);

  useEffect(() => {
    if (savedTasks.message === "No tasks") return;
    setTasksGeneradas((prev: any) => {
      const idsGenerados = prev.map((task: any) => task.id);
      const savedTasksGenerated = savedTasks.filter(
        (task: any) => task.generated !== null && !idsGenerados.includes(task.baseID)
      );
      return [
        ...prev,
        ...savedTasksGenerated.map((task: any) => ({
          id: task.baseID,
          status: 1,
          title: task.title,
          generated: task.generated,
        })),
      ];
    });
  }, []);

  useEffect(() => {
    setIDsGenerados(tasksGeneradas.map((task: any) => task.id));
  }, [tasksGeneradas]);

  const [viewedTask, setViewedTask] = useState<any>(null);

  return (
    <section className="min-h-[calc(100vh-60px)] sm:h-185 w-full flex flex-col sm:flex-row items-start justify-start px-3 sm:pl-8 sm:pr-0 py-0 pb-0 bg-[#191a1c7d] overflow-scroll">

      {/* Área principal de tareas */}
      <div className="flex-1 mt-6 sm:mt-8 mr-0 sm:mr-8 w-full">
        <div className="flex gap-4 sm:gap-6">
          <h3 className="text-2xl sm:text-3xl text-(--white-color) font-medium mb-6 sm:mb-9">
            Tus actividades
          </h3>
          <button
            className="text-xl w-10 h-10 text-(--white-color) bg-[#3b3b3c] flex items-center justify-center rounded cursor-pointer"
            onClick={() => setActive(0)}
          >
            <i className="fa-solid fa-angle-up"></i>
          </button>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-start justify-start">
          {selectedTask && (
            <TaskContext
              task={selectedTask}
              tasksAnswers={tasksAnswers}
              setTasksAnswers={setTasksAnswers}
              setTasksGeneradas={setTasksGeneradas}
              setSelectedTask={setSelectedTask}
              setSavedTasks={setSavedTasks}
              IDsGenerados={IDsGenerados}
            />
          )}
          <div
            className={`w-full h-full grid grid-cols-1 sm:grid-cols-2 ${
              activeRightBar ? "lg:grid-cols-2" : "lg:grid-cols-3"
            } gap-y-6 sm:gap-y-10 gap-x-3 sm:gap-x-5`}
          >
            {tasks.length <= 1 && savedTasks.message && (
              <div className="bg-[#202225] p-4 px-7 w-fit rounded-2xl shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]">
                <h4 className="text-xl">No hay tareas guardadas</h4>
              </div>
            )}

            {tasks.map((task: any, index: number) => {
              if (!task.title) return;
              let [year, month, day] = task.date.split("-");
              return (
                <div
                  key={index}
                  className={`task-box ${selectedTask?.id === task.id ? "task-box-selected" : ""}`}
                >
                  <span>{task.time}</span>
                  <button
                    onClick={() => {
                      if (selectedTask?.id === task.id) setSelectedTask(null);
                      handleDeleteSavedTasks(task.id);
                      setTasks((prev: any) => prev.filter((t: any) => t.id !== task.id));
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  {task.context !== undefined && (
                    <button
                      onClick={() => {
                        if (selectedTask?.id === task.id) { setSelectedTask(null); return; }
                        setSelectedTask(task);
                      }}
                      className="context-btn"
                    >
                      <i className="fa-solid fa-bars-staggered"></i>
                    </button>
                  )}
                  {IDsGenerados.includes(task.id) && (
                    <button className="answer-btn" onClick={() => setActiveRightBar(true)}>
                      <i className="fa-solid fa-check"></i>
                    </button>
                  )}
                  <div><h5>{formatearFecha(year, month, day)}</h5></div>
                  <h4>{task.title}</h4>
                  <p>{task.desc}</p>
                </div>
              );
            })}

            {savedTasks.length > 0 &&
              savedTasks.map((task: any, index: number) => {
                let year = task.year;
                let month = task.month;
                let day = task.day;
                return (
                  <div
                    key={index}
                    className={`task-box task-box-green ${selectedTask?.id === task.id ? "task-box-selected" : ""}`}
                  >
                    <span>{task.hour}</span>
                    <button
                      onClick={() => {
                        if (selectedTask?.id === task.id) setSelectedTask(null);
                        handleDeleteSavedTasks(task.baseID);
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTask?.id === task.id) { setSelectedTask(null); return; }
                        setSelectedTask(task);
                      }}
                      className="context-btn"
                    >
                      <i className="fa-solid fa-bars-staggered"></i>
                    </button>
                    {IDsGenerados.includes(task.baseID) && (
                      <button className="answer-btn" onClick={() => setActiveRightBar(true)}>
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    <div><h5>{formatearFecha(year, month, day)}</h5></div>
                    <h4>{task.title}</h4>
                    <p>{task.desc}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Barra lateral derecha */}
      <div
        className={`${
          viewedTask !== null
            ? "fixed inset-0 z-30"
            : "sm:h-full w-full sm:w-fit"
        } flex items-start justify-start transition-all duration-800`}
      >
        {/* Toggle button — oculto en móvil cuando no hay rightbar activo, visible en sm+ siempre */}
        <button
          className={`w-7 h-10 sm:h-full bg-[#343739] flex items-center justify-center shadow-[0px_0px_25px_rgba(0,0,0,0.2)] cursor-pointer transition-all hover:bg-[#3b3b3c] border-r border-[#7D7D81] ${activeRightBar ? "flex" : "hidden sm:flex"}`}
          onClick={() => {
            if (activeRightBar) setViewedTask(null);
            setActiveRightBar(!activeRightBar);
          }}
        >
          <i
            className={`fa-solid fa-angle-down transform ${
              activeRightBar ? "-rotate-90" : "rotate-90"
            } text-2xl text-[#7D7D81]`}
          ></i>
        </button>

        {activeRightBar && (
          <div className="h-full w-full sm:w-70 flex flex-col">
            <div className="flex flex-col items-start justify-start h-[65%] p-6 bg-[linear-gradient(16deg,#1a1b1d_40%,#452E4C_100%)]">
              <h5 className="text-[20px] sm:text-[22px] text-(--white-color) mb-4">
                Tareas resueltas
              </h5>
              <div className="w-full flex flex-col gap-y-2 items-start justify-start overflow-scroll">
                {tasksGeneradas.map((task: any, index: number) => {
                  if (task.status === 0) return;
                  return (
                    <button
                      key={index}
                      className={`p-2 py-2.5 rounded-lg text-(--white-color) w-full text-left cursor-pointer shadow-[0px_0px_20px_rgba(0,0,0,0.2)] hover:scale-95 hover:bg-[#784e4e97] transition-all lovr-background ${
                        viewedTask?.id === task.id && "border-2 border-[#ae8b8b97] scale-95"
                      }`}
                      onClick={() => setViewedTask(task)}
                    >
                      {task.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <h5 className="text-[20px] sm:text-[22px] text-(--white-color) pl-6 bg-[#1A1B1D] w-full h-10">
              En proceso
            </h5>
            <div className="flex flex-col items-start justify-start p-6 pt-3 h-[35%] overflow-scroll bg-[linear-gradient(340deg,#584F2D_0%,#1a1b1d_70%)]">
              <div className="w-full flex flex-col gap-y-2 items-start justify-start">
                {tasksGeneradas.map((task: any, index: number) => {
                  if (task.status === 1) return;
                  return (
                    <div
                      key={index}
                      className="p-2 rounded-lg bg-[#c7ac4a5c] text-(--white-color) w-full text-left px-3 shadow-[0px_0px_20px_rgba(0,0,0,0.2)] flex items-center"
                    >
                      <p className="truncate w-full h-full">{task.title}</p>
                      <i className="fa-solid fa-hourglass-half ml-auto text-[18px] text-[#e9d1a6]"></i>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewedTask && (
          <GeneratedTaskView
            viewedTask={viewedTask}
            setViewedTask={setViewedTask}
            activeUser={activeUser}
          />
        )}
      </div>

      {/* Botón flotante para abrir la barra en móvil cuando está cerrada */}
      {!activeRightBar && tasksGeneradas.some((t: any) => t.status === 1) && (
        <button
          className="sm:hidden fixed bottom-20 right-4 z-20 w-12 h-12 bg-[#452E4C] rounded-full flex items-center justify-center shadow-lg border border-[#7D7D81]"
          onClick={() => setActiveRightBar(true)}
        >
          <i className="fa-solid fa-check text-white"></i>
        </button>
      )}
    </section>
  );
}