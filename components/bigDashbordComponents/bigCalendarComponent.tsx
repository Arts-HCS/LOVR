"use client";

import { useEffect, useState } from "react";

export default function BigCalendarComponent({ active, tasks, setActive, savedTasks }: any) {
  const weekDays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const weekDaysShort = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = new Date(year, month + 1, 0).getDate();
  const actualMonth = months[month];
  const startingDay = new Date(year, month, 1).getDay();

  const handleMonthChange = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const returnToNow = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const tasksByDay: Record<number, string[]> = {};

  tasks.forEach((task: any) => {
    if (!task.title || !task.date) return;

    const [y, m, d] = task.date.split("-").map(Number);

    if (y !== year || m - 1 !== month) return;

    if (!tasksByDay[d]) {
      tasksByDay[d] = [];
    }

    tasksByDay[d].push([task.title, task.time]);
  });

  if (savedTasks.length > 0) {
    savedTasks.forEach((task: any) => {
      if (task.day === undefined) return;

      if (task.year !== year || task.month - 1 !== month) return;

      if (!tasksByDay[task.day]) {
        tasksByDay[task.day] = [];
      }
      tasksByDay[task.day].push([task.title, task.hour, task.id]);
    });
  }

  const actualDate = () => {
    if (!selectedDate) return;
    const fecha = new Date(selectedDate[0], selectedDate[1], selectedDate[2]);
    return weekDays[fecha.getDay()];
  };

  const selectedDayTasks = selectedDate
    ? tasksByDay[selectedDate[2]] ?? []
    : [];

  return (
    <section
      className={`w-full px-2 sm:px-8 relative h-full flex overflow-scroll ${
        active ? "flex-3 pb-20 mb-2 shadow-[inset_0_2px_8px_#202225]" : ""
      } ${selectedDate ? "sm:pl-95" : ""}`}
    >
      {/* Panel de día seleccionado */}
      <div
        className={`${
          selectedDate ? "flex" : "hidden"
        } flex-col fixed w-full sm:w-90 h-auto sm:h-125 rounded-tl-xl rounded-tr-xl bottom-14 sm:bottom-0 left-0 sm:left-25 border border-[#a6a8c4a6] p-6 bg-[#202225] z-20`}
      >
        <button onClick={() => setSelectedDate(null)} className="absolute top-4 right-4 cursor-pointer p-1">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <h4 className="text-[22px] sm:text-[25px] font-medium">
          {actualDate()} {selectedDate && selectedDate[2]}
        </h4>
        <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
          {selectedDayTasks.length === 0 && (
            <span className="text-gray-400 text-[16px]">
              No hay tareas para este día
            </span>
          )}

          {selectedDayTasks.map((task, i) => (
            <div
              key={i}
              className={`${task.length === 3 ? "bg-[#4b8056]" : "bg-[#595FB1]"} text-[#040404] rounded px-2 py-1.5 text-[15px] sm:text-[17px] w-full flex items-center justify-start cursor-pointer`}
              onClick={() => setActive(2)}
            >
              <p className="w-full flex">
                <span className="mr-2 truncate">{task[0]}</span>
                <span className="ml-auto">{task[1]}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[full] p-2 sm:p-4 rounded-[10px] relative">
        {/* Título del mes */}
        <h3
          className={`text-xl sm:text-2xl text-(--white-color) font-medium mb-4 w-full bg-[#202225] h-15 ${
            active ? "fixed z-10 top-[7%] left-16 sm:left-30" : "top-0 left-0"
          } ${selectedDate ? "sm:ml-90" : ""}`}
        >
          {actualMonth} {year}
        </h3>

        {/* Botones de navegación */}
        <div
          className={`ml-auto mr-2 flex items-center gap-3 sm:gap-5 ${
            active ? "fixed top-[8%] right-4 sm:right-15 z-10" : "absolute top-1 right-0"
          }`}
        >
          {(month !== today.getMonth() || year !== today.getFullYear()) && (
            <button
              onClick={returnToNow}
              className="w-16 sm:w-24 h-8 sm:h-9 text-sm sm:text-base font-medium bg-[#b8bae0f3] text-(--black-color) rounded cursor-pointer hover:bg-[#7a7c95c7] hover:text-gray-200 transition-all"
            >
              Volver
            </button>
          )}

          <button className="cursor-pointer" onClick={() => handleMonthChange(-1)}>
            <i className="fa-solid fa-circle-arrow-left text-[32px] sm:text-[42px] text-[#DCD9DE] transition-all hover:text-[#b8bae0c7] hover:scale-110"></i>
          </button>

          <button className="cursor-pointer" onClick={() => handleMonthChange(1)}>
            <i className="fa-solid fa-circle-arrow-right text-[32px] sm:text-[42px] text-[#DCD9DE] transition-all hover:text-[#b8bae0c7] hover:scale-110"></i>
          </button>
        </div>

        {/* Cabecera días de la semana */}
        <div className={`grid grid-cols-7 mb-2 ${active ? "pt-15" : "pt-0"}`}>
          {weekDays.map((d, i) => (
            <div
              key={d}
              className="text-center text-[13px] sm:text-[17px] font-medium text-gray-400"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{weekDaysShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-y-1.5 sm:gap-y-2.5 gap-x-1 sm:gap-x-3 overflow-scroll pb-8">
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={i}></div>
          ))}

          {Array.from({ length: monthDays }).map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            const dayTasks = tasksByDay[day] ?? [];
            const isSelected = (selectedDate && selectedDate[2]) === day;

            return (
              <div
                key={i}
                onClick={() => setSelectedDate([year, month, day])}
                className={`
                  rounded-lg border cursor-pointer transition h-16 sm:h-32 relative px-1 sm:px-2 pt-5 sm:pt-7 pb-1 sm:pb-2 overflow-y-hidden sm:overflow-y-scroll shadow-2xl w-full
                  ${
                    isToday
                      ? `${isSelected ? "bg-[#dbe1e9b8]" : "bg-[#DCD9DE]"} text-gray-800 border-gray-200 hover:bg-[#b0aeb1] hover:text-gray-800`
                      : `${isSelected ? "bg-[#19191be5]" : "bg-[#232325c7]"} text-gray-200 border-[#454a826b] hover:bg-[#19191bc7]`
                  }
                `}
              >
                <p className="text-[11px] sm:text-[15px] absolute top-1 left-1 sm:left-2">{day}</p>
                {dayTasks.length > 0 && (
                  <div className="hidden sm:flex flex-col items-start justify-start gap-1.5">
                    {dayTasks.map((task: any, index: number) => (
                      <span
                        key={index}
                        className={`text-[13px] ${task.length === 3 ? "bg-[#4b8056]" : "bg-[#595FB1]"} text-[#111112] rounded px-1 py-0.5 truncate w-full`}
                      >
                        {task[0]}
                      </span>
                    ))}
                  </div>
                )}
                {/* Indicador compacto de tareas en móvil */}
                {dayTasks.length > 0 && (
                  <div className="sm:hidden absolute bottom-1 left-1 flex gap-0.5">
                    {dayTasks.slice(0, 3).map((task: any, index: number) => (
                      <span
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${task.length === 3 ? "bg-[#4b8056]" : "bg-[#595FB1]"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}