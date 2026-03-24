"use client";

import { useState } from "react";

type Props = {
  setBaseText: React.Dispatch<React.SetStateAction<string>>;
  setGottenName: React.Dispatch<React.SetStateAction<string>>;
  setSuccess: any;
};

export default function RegisterForm({
  setBaseText,
  setGottenName,
  setSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, email, password, confirmpassword } = formData;

    if (password !== confirmpassword) {
      setError(true);
      return;
    }

    try {
      setLoading(true);

      const data = await fetch("/api/registerUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const resp = await data.json();

      if (resp.message === "existente") {
        setBaseText("Tu cuenta ya existe");
      }

      if (resp.message === "exito") {
        setSuccess(true);
        setBaseText("El mundo es tuyo");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSend(e)} className="flex flex-col w-[84%] p-5">
      <label className="mb-2 text-xl" htmlFor="name">
        Nombre
      </label>
      <input
        type="text"
        required
        name="name"
        onChange={(e) => {
          setError(false);
          setFormData({ ...formData, name: e.target.value });
        }}
        value={formData.name}
        onBlur={(e) => setGottenName(e.target.value.split(" ")[0])}
        id="name"
        className="input-styles capitalize"
        placeholder="Escribe tu nombre..."
      />
      <label className="mb-2 text-xl" htmlFor="email">
        Email
      </label>
      <input
        type="email"
        required
        name="email"
        id="email"
        onChange={(e) => {
          setError(false);
          setFormData({ ...formData, email: e.target.value });
        }}
        value={formData.email}
        className="input-styles"
        placeholder="Escribe tu correo electrónico..."
      />
      <label className="mb-2 text-xl" htmlFor="password">
        Contraseña
      </label>
      <input
        type="password"
        required
        name="password"
        onChange={(e) => {
          setError(false);
          setFormData({ ...formData, password: e.target.value });
        }}
        value={formData.password}
        id="password"
        className="input-styles"
        placeholder="Escribe tu contraseña..."
      />
      <label className="mb-2 text-xl" htmlFor="confirmpassword">
        Confirmar contraseña
      </label>
      <input
        type="password"
        required
        name="confirmpassword"
        id="confirmpassword"
        onChange={(e) => {
          setError(false);
          setFormData({ ...formData, confirmpassword: e.target.value });
        }}
        value={formData.confirmpassword}
        className="input-styles"
        placeholder="Confirma tu contraseña..."
      />
      {error && (
        <h1 className="text-center text-2xl mb-4 bg-(--red-color) rounded-2xl">
          Las contraseñas no coinciden
        </h1>
      )}
      <button
        disabled={loading}
        type="submit"
        className="bg-(--blackground) text-(--white-color) p-3 rounded-2xl hover:bg-(--background) hover:text-(--black-color) transition-all cursor-pointer"
      >
        {loading ? "Cargando..." : "Registrarme"}
      </button>
    </form>
  );
}
