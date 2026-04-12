"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ChangePassword from "../ui/changePassword";

// ─── Types ───────────────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-(--white-color) opacity-40">
        {label}
      </span>
      <div className="flex-1 h-px bg-(--white-color) opacity-10" />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value, 
  onChange
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/5">
      <div>
        <p className="text-(--white-color) text-[18px] font-medium">{label}</p>
        {description && (
          <p className="text-(--white-color) opacity-40 text-[14px] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          value ? "bg-green-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function ActionRow({
  label,
  description,
  actionLabel,
  actionVariant = "default",
  onClick,
}: {
  label: string;
  description?: string;
  actionLabel: string;
  actionVariant?: "default" | "danger";
  onClick: () => void;
}) {


  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/5">
      <div>
        <p className="text-(--white-color) text-[18px] font-medium">{label}</p>
        {description && (
          <p className="text-(--white-color) opacity-40 text-[14px] mt-0.5 ">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={onClick}
        className={`text-[13px] font-medium px-4 py-1.5 rounded-lg border transition-colors duration-150 cursor-pointer ${
          actionVariant === "danger"
            ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
            : "border-white/10 text-(--white-color) opacity-60 hover:opacity-100 hover:bg-white/5"
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BigConfiguration({activeUser}: {activeUser: any}) {
  const route = useRouter();

  const [passwordChange, setPasswordChange] = useState(false);

  const [privacy, setPrivacy] = useState(true)


  const handleChangePassword = () => {
    setPasswordChange(!passwordChange);
  }
  const handleDeleteAccount = async () => {
    await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUser.id }),
    })
    
    localStorage.removeItem("userWelcome");
    route.replace("/login");
  }
  const handleSignOut = () => {
    localStorage.removeItem("userWelcome");
    route.replace("/login");
  }

  const [user, setUser] = useState(activeUser);

  return (
    <section className="px-5 relative w-full h-full overflow-y-auto pb-10">
      <div className="config-blur"></div>

      <div className="flex items-center justify-start w-full">
        <h3 className="text-3xl font-medium text-(--white-color)">
          Configuraciones
        </h3>
        <Image
          src="/lovr.png"
          alt="Logo image"
          width={80}
          height={80}
          className="ml-5"
        />
      </div>
      <p className="text-(--white-color) text-[17px]">
        <span className="font-semibold">LOVR Versión: </span>1.5.2
      </p>

      <SectionDivider label="Cuenta" />

      <ActionRow
        label="Contraseña"
        description="Todo mientras lo recuerdes..."
        actionLabel={passwordChange ? "Cancelar cambio" : "Cambiar"}
        onClick={handleChangePassword}
      />
        {
          passwordChange && <ChangePassword activeUser={user} setUser={setUser} setPasswordChange={setPasswordChange} />
        }

      <SectionDivider label="Privacidad y datos" />

      <ToggleRow
        label="Compartir datos de uso"
        description="Ayúdanos a mejorar LOVR de forma anónima"
        value={privacy}
        onChange={()=> setPrivacy(!privacy)}
      /> 
      <SectionDivider label="Zona de peligro" />

      <ActionRow
        label="Cerrar sesión"
        description="Cierra sesión en este dispositivo"
        actionLabel="Cerrar sesión"
        onClick={handleSignOut}
      />
      <ActionRow
        label="Eliminar cuenta"
        description="Esta acción es permanente e irreversible"
        actionLabel="Eliminar"
        actionVariant="danger"
        onClick={handleDeleteAccount}
      />
    </section>
  );
}