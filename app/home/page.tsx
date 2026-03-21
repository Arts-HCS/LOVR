"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

import BigWritingComponent from "@/components/bigDashbordComponents/bigWritingComponent";
import BigTasksComponent from "@/components/bigDashbordComponents/bigTasksComponent";
import BigCalendarComponent from "@/components/bigDashbordComponents/bigCalendarComponent";
import BigHeartComponent from "@/components/bigDashbordComponents/bigHeartComponent";
import UserBox from "@/components/ui/userBox";

export interface Task {
  id: string;
  content: string;
  status: number;
  answer?: string;
  date?: string;
  time?: string;
  desc?: string;
  title?: string;
  context?: any;
  userID?: string;
}

export default function Home() {
  const [activeUser, setActiveUser] = useState<any>(null);

  async function userWelcome() {
    const stored = localStorage.getItem("userWelcome");

    if (!stored) {
      route.replace("/login?unauthorized=1");
      return;
    }
    const data = JSON.parse(stored).userId;
    const resp = await fetch("/api/userWelcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data,
      }),
    });
    const user = await resp.json();
    setActiveUser(user);
  }

  useEffect(() => {
    userWelcome();
    const firstInput = inputRefs.current[0];
    firstInput?.focus();
  }, []);

  useEffect(() => {
    if (!activeUser) return;
  }, [activeUser]);

  const route = useRouter();

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const userBoxRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [userBoxActive, setUserBoxActive] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: Date.now().toString().slice(-6),
      content: "",
      status: 0,
    },
  ]);
  const [savedTasks, setSavedTasks] = useState([]);

  useEffect(() => {
    const readyTasks = tasks
      .filter((task) => task.title && task.context)
      .map((task) => ({ ...task, userID: activeUser.id }));

    const uploadTasks = async () => {
      const resp = await fetch("/api/saveNewTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: readyTasks,
        }),
      });
    };
    if (readyTasks.length > 0) uploadTasks();
  }, [tasks]);

  async function getSavedTasks() {
    const tasks = await fetch("/api/getSavedTasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: activeUser?.id,
      }),
    });
    const resp = await tasks.json();
    setSavedTasks(resp);
  }

  const prevActiveUserRef = useRef(activeUser);

  useEffect(() => {
    if (prevActiveUserRef.current?.id !== activeUser?.id) {
      getSavedTasks();
      setTasksGeneradas([]);
      prevActiveUserRef.current = activeUser;
    }
  }, [activeUser]);

  const handleChange = (id: string, text: string, index: number) => {
    setTasks((prev) => {
      let updated = prev.map((task) =>
        task.id === id ? { ...task, content: text } : task
      );
      if (text.trim() === "" && index !== tasks.length - 1) {
        updated = updated.filter((task) => task.id !== id);
      }
      const last = updated[updated.length - 1];
      if (last && last.content.length > 3) {
        updated.push({
          id: Date.now().toString().slice(-6),
          content: "",
          status: 0,
        });
      }
      return updated;
    });
  };

  const abortControllers = useRef<Record<string, AbortController>>({});

  const handleKeyDown = async (e: any, id: string) => {
    if (e.key === "Backspace") {
      if (abortControllers.current[id]) {
        // 1. Abortamos la petición de red inmediatamente
        abortControllers.current[id].abort();
        // 2. Limpiamos la referencia
        delete abortControllers.current[id];

        // 3. Cambiamos el status a 5 (anulado)
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? { ...task, status: 5 } : task))
        );
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    
      const nextInput = inputRefs.current[inputRefs.current.length - 1];
      if (nextInput) nextInput.focus();
    
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
    
      const { content } = task;
      if (content.startsWith("8") || content.length < 2) return;
    
      // --- CONTROLADOR DE ABORTO ---
      if (abortControllers.current[id]) abortControllers.current[id].abort();
      const controller = new AbortController();
      abortControllers.current[id] = controller;
    
      // Estado inicial: Cargando
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 1 } : t))
      );
    
      // --- PETICIÓN 1: CREAR TAREA (Prioridad) ---
      fetch("/api/createTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ content }),
      })
        .then((res) => res.json())
        .then((data) => {
          const answer = data.answer.split(",");
          const [date, time, desc, title] = [answer[0], answer[1], answer[2], answer[3]];
    
          if (date === "Error") {
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 2 } : t)));
          } else {
            // ACTUALIZAMOS SOLO LOS DATOS DE LA TAREA
            setTasks((prev) =>
              prev.map((t) =>
                t.id === id ? { ...t, date, time, desc, title, status: 3 } : t
              )
            );
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Error en createTask:", err);
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 2 } : t)));
          }
        });
    
      // --- PETICIÓN 2: OPCIONES (Segundo plano) ---
      fetch("/api/createTaskOptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ taskTitle: content }),
      })
        .then((res) => res.json())
        .then((optionsRaw) => {
          const parsedOptions = JSON.parse(optionsRaw);
          
          // ACTUALIZAMOS SOLO EL CONTEXTO (sin tocar el status ni la fecha)
          setTasks((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, context: parsedOptions } : t
            )
          );
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error("Error en options:", err);
        })
        .finally(() => {
          // Limpiamos el controlador solo al final de todo
          delete abortControllers.current[id];
        });
    }

    // --- LÓGICA RESTANTE DE TECLAS ---
    const hasAnswer = tasks.find((task) => task.id === id)?.date;

    // Backspace cuando NO hay respuesta (y no hay petición activa que abortar)
    if (e.key === "Backspace" && !hasAnswer && abortControllers.current[id]) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status: 5 } : task))
      );
    }

    if (e.key === "Backspace" && hasAnswer) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status: 4 } : task))
      );
    }

    if (e.key === " " && hasAnswer) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status: 4 } : task))
      );
    }

    // Borrado de input vacío
    if (
      e.key === "Backspace" &&
      e.currentTarget.value === "" &&
      tasks.length > 1
    ) {
      e.currentTarget.blur();
      setTasks((prev) => prev.filter((task) => task.id !== id));
      const nextInput = inputRefs.current[inputRefs.current.length - 2];
      if (nextInput) nextInput.focus();
    }
  };

  // USE STATES PARA LOS BOTONES DEL LADO DERECHO
  const icons = ["fa-house", "fa-calendar", "fa-list-check", "fa-dna"];

  const [active, setActive] = useState<number | null>(0);

  function toggleButton(index: number) {
    setActive((prev) => {
      if (prev == index){
        return null
      }  

      return index;
    });
  }

  useEffect(() => {
    function detectClick(e: MouseEvent) {
      if (
        userBoxActive &&
        userBoxRef.current &&
        !userBoxRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setUserBoxActive(false);
      }
    }
    document.addEventListener("mousedown", detectClick);

    return () => {
      document.removeEventListener("mousedown", detectClick);
    };
  }, [userBoxActive]);

  const [heartSectionActive, setHeartSectionActive] = useState(false);

  // useEffect(() => {
  //   if (active.length === 1 && active.includes(4)) {
  //     setHeartSectionActive(true);
  //   } else {
  //     setHeartSectionActive(false);
  //   }
  // }, [active.length]);


  // Tasks generadas que se guarden 
  
  interface TaskGenerada {
    taskID: string;
    status: number;
    title: string;
    generated: string;
  }

  const [tasksGeneradas, setTasksGeneradas] = useState<TaskGenerada[]>([]);

  return (
    <main className="bg-[#202225] flex items-start justify-start w-full max-h-screen h-screen overflow-hidden">
      <div className="h-full w-full flex flex-col items-start justify-start">
        <header className="w-full p-4 flex items-center justify-start h-15">
          {heartSectionActive && (
            <button
              className="side-button"
              onClick={() => setHeartSectionActive(false)}
            >
              <i className="fa-solid fa-dna"></i>
            </button>
          )}
          <button
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#2F3136] rounded-md transition-all text-[17px]"
            onClick={() => {}}
          >
            {activeUser ? activeUser.name : "Cargando..."}
            <i className="fa-solid fa-chevron-down text-[14px] text-[#6b6e91]"></i>
          </button>
        </header>

        <div className="flex h-full w-full items-start justify-start overflow-scroll">
          <UserBox
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            userBoxActive={userBoxActive}
            ref={userBoxRef}
          ></UserBox>
          <div
            className={`h-full w-20 border-r border-[#dcd9de7f] ${
              heartSectionActive
                ? "hidden"
                : "flex flex-col gap-4 p-4 items-center justify-center relative"
            }`}
          >
            <div className="black-shadow"></div>
            {icons.map((icon, i) => (
              <button
                key={i}
                onClick={() => toggleButton(i)}
                className={`side-button ${
                  active == i ? "button-active" : ""
                }`}
              >
                <i className={`fa-solid ${icon}`}></i>
              </button>
            ))}
            <div className="absolute bottom-4 right-4 flex flex-col items-center">
              <button
                className="w-8 h-8 roundef-full text-[18px] flex items-center   justify-center p-6  hover:bg-[#2F3136] hover:shadow-  [0_0_10px_#2F3136] rounded-2xl transition-all cursor-pointer"
                onClick={() => setUserBoxActive(!userBoxActive)}
                ref={buttonRef}
              >
                <i className="fa-solid fa-user text-[#979797]"></i>
              </button>
              <button className="w-8 h-8 roundef-full text-[18px] flex items-center   justify-center p-6 hover:bg-[#2F3136] hover:shadow-   [0_0_10px_#2F3136] rounded-2xl transition-all">
                <i className="fa-solid fa-gear text-[#979797]"></i>
              </button>
            </div>
          </div>

          {active === null && (
            <BigWritingComponent
            tasks={tasks}
            setTasks={setTasks}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            inputRefs={inputRefs}
            active={active}
            setActive={setActive}
          />
          )}

          {active === 0 && (
            <div className="flex flex-col items-start justify-start h-full w-full ">
            <BigWritingComponent
              tasks={tasks}
              setTasks={setTasks}
              handleChange={handleChange}
              handleKeyDown={handleKeyDown}
              inputRefs={inputRefs}
              active={active}
              setActive={setActive}
            />
            <BigCalendarComponent
              active={active}
              setActive={setActive}
              tasks={tasks}
              savedTasks={savedTasks}
            />
          </div>
          )}

          {active === 1 && (
            <BigCalendarComponent tasks={tasks} savedTasks={savedTasks} />
          )}

          {active === 2 && (
            <BigTasksComponent
              tasks={tasks}
              setTasks={setTasks}
              setActive={setActive}
              activeUser={activeUser}
              savedTasks={savedTasks}
              setSavedTasks={setSavedTasks}
              setTasksGeneradas={setTasksGeneradas}
              tasksGeneradas={tasksGeneradas}
            />
          )}
          {active === 3 && (
            <BigHeartComponent activeUser={activeUser} setActiveUser={setActiveUser} />
          )}

         
        </div>
      </div>
    </main>
  );
}
