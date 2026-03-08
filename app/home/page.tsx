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

  useEffect(() => {
    getSavedTasks();
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
    // --- LÓGICA DE ABORTO (Si presionas Backspace y hay una petición activa) ---
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
        console.log("Petición anulada por el usuario");
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();

      const nextInput = inputRefs.current[inputRefs.current.length - 1];
      if (nextInput) nextInput.focus();

      const task = tasks.find((task) => task.id === id);
      if (!task) return;

      const { content } = task;
      if (content.startsWith("8")) return;

      // --- INICIO DE PETICIÓN CON CONTROLADOR ---

      // Si ya había uno por alguna razón, lo cancelamos antes de empezar
      if (abortControllers.current[id]) abortControllers.current[id].abort();

      // Creamos el nuevo controlador para esta tarea
      const controller = new AbortController();
      abortControllers.current[id] = controller;

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status: 1 } : task))
      );

      try {
        // Petición de Opciones (Fetch 1)
        const taskOptions = await fetch("/api/createTaskOptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal, // VINCULADO
          body: JSON.stringify({ taskTitle: content }),
        });

        const options = await taskOptions.json();
        const parsed = JSON.parse(options);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, context: parsed } : task
          )
        );

        // Petición de Creación (Fetch 2)
        const data = await fetch("/api/createTask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal, // VINCULADO
          body: JSON.stringify({ content }),
        });

        const resp = await data.json();

        // Si llegamos aquí con éxito, eliminamos el controlador de la lista de "activos"
        delete abortControllers.current[id];

        const answer = resp.answer.split(",");
        const [date, time, desc, title] = [
          answer[0],
          answer[1],
          answer[2],
          answer[3],
        ];

        if (date === "Error") {
          setTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, status: 2 } : task))
          );
          return;
        }

        setTasks((prev) =>
          prev.map((task) =>
            task.id === id
              ? { ...task, date, time, desc, title, status: 3 }
              : task
          )
        );
      } catch (error: any) {
        // Manejamos el caso de que la petición fuera abortada
        if (error.name === "AbortError") {
          console.warn("La operación fue detenida intencionalmente.");
          return; // Salimos de la función sin actualizar a status de éxito
        }
        console.error("Error en la petición:", error);
        delete abortControllers.current[id];
      }
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
  const icons = ["fa-file-pen", "fa-calendar", "fa-list-check", "fa-dna"];

  const [active, setActive] = useState<number[]>([0, 1]);

  function toggleButton(index: number) {
    setActive((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, index];
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

  useEffect(() => {
    if (active.length === 1 && active.includes(4)) {
      setHeartSectionActive(true);
    } else {
      setHeartSectionActive(false);
    }
  }, [active.length]);

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
                  active.includes(i) ? "button-active" : ""
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

          {active.length === 1 && active.includes(0) && (
            <BigWritingComponent
              tasks={tasks}
              setTasks={setTasks}
              handleChange={handleChange}
              handleKeyDown={handleKeyDown}
              inputRefs={inputRefs}
              setActive={setActive}
            />
          )}
          {active.length === 1 && active.includes(1) && (
            <BigCalendarComponent tasks={tasks} savedTasks={savedTasks} />
          )}
          {active.length === 1 && active.includes(2) && (
            <BigTasksComponent
              tasks={tasks}
              setTasks={setTasks}
              setActive={setActive}
              activeUser={activeUser}
              savedTasks={savedTasks}
              setSavedTasks={setSavedTasks}
            />
          )}
          {active.length === 1 && active.includes(3) && (
            <BigHeartComponent activeUser={activeUser} />
          )}

          {/* De dos -------- */}

          {active.length === 2 && active.includes(0) && active.includes(1) && (
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

          {active.length === 2 && active.includes(0) && active.includes(2) && (
            <div className="flex items-start justify-start h-full w-full ">
              <BigWritingComponent
                tasks={tasks}
                setTasks={setTasks}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
                inputRefs={inputRefs}
                active={active}
                setActive={setActive}
              />
              <BigTasksComponent
              tasks={tasks}
              setTasks={setTasks}
              setActive={setActive}
              activeUser={activeUser}
              savedTasks={savedTasks}
              setSavedTasks={setSavedTasks}
            />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
