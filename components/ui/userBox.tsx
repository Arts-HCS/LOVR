import { forwardRef, useEffect, useRef, useState } from "react";

const UserBox = forwardRef(({ activeUser, setActiveUser, userBoxActive, setUserBoxActive }: any, ref: any) => {
  const [localUser, setLocalUser] = useState(activeUser);
  const prevActiveRef = useRef(userBoxActive);

  // Sincroniza cuando cambia el usuario externo
  useEffect(() => {
    setLocalUser(activeUser);
  }, [activeUser]);

  // Guarda cuando se cierra el panel
  useEffect(() => {
    const wasOpen = prevActiveRef.current;
    const isNowClosed = !userBoxActive;

    if (wasOpen && isNowClosed && localUser) {
      saveUser();
    }

    prevActiveRef.current = userBoxActive;
  }, [userBoxActive]);

  async function saveUser() {
    try {
      const resp = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: localUser }),
      });

      if (resp.ok) {
        setActiveUser(localUser); // Confirma los cambios globalmente
      }
      setUserBoxActive(false);
    } catch (err) {
      console.error("Error guardando usuario:", err);
    }
  }

  const fields = [
    { label: "Nombre", key: "name", placeholder: "Tu nombre..." },
    { label: "Apodo", key: "apodo", placeholder: "Crea un apodo..." },
    { label: "Nombre de tu modelo", key: "modelName", placeholder: "Original..." },
  ];

  return (
    <div
      ref={ref}
      className={`${
        userBoxActive ? "fixed opacity-100 translate-y-0" : "hidden opacity-0 translate-y-2"
      } w-64 h-fit rounded-2xl bg-[#26282b] border border-[#6e73794b] bottom-30 left-5 z-20 shadow-2xl p-4 transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#979797] font-medium tracking-wide uppercase">Perfil</p>
        <div className="w-2 h-2 rounded-full bg-green-500" title="Guardado automático al cerrar" />
      </div>

      <div className="flex flex-col gap-4">
        {fields.map(({ label, key, placeholder }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-[13px] text-[#6b6e91]">{label}</label>
            <input
              type="text"
              placeholder={placeholder}
              className="w-full outline-none border-b border-[#6e737970] pb-1 bg-transparent text-[15px] focus:border-[#5865F2] transition-colors"
              value={localUser?.[key] ?? ""}
              onChange={(e) =>
                setLocalUser((prev: any) => ({ ...prev, [key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={saveUser}
        className="mt-5 w-full py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium transition-all cursor-pointer"
      >
        Guardar
      </button>
    </div>
  );
});

UserBox.displayName = "UserBox";
export default UserBox;