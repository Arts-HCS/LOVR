"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function createToken() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [fetchResponse, setFetchResponse] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password } = formData;

    const data = await fetch("/api/loginUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const resp = await data.json();
    setFetchResponse(resp.message);

    if (resp.message === "exito") {
      const userId = resp.user.id;

      localStorage.setItem("userWelcome", JSON.stringify({ userId }));
      router.push(`/home`);
    }
  };

  useEffect(() => {
    if (searchParams.get("unauthorized") === "1") {
      setUnauthorized(true);
      router.replace("/login");
    }

    localStorage.removeItem("userWelcome");
    localStorage.removeItem("texts");
  }, [searchParams, router]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full xl:w-[70%] p-5 border-[#3B3440] border-2 rounded-2xl glass-dark bg-[#0c0d0e86]"
    >
      <label className="block mb-2 text-[20px]" htmlFor="email">
        Email
      </label>

      <input
        className="input-styles"
        type="email"
        required
        name="email"
        id="email"
        value={formData.email}
        onChange={(e) => {
          setFetchResponse("");
          setUnauthorized(false);
          setFormData({ ...formData, email: e.target.value });
        }}
        placeholder="Escribe tu correo electrónico..."
      />

      <label className="block mb-2 text-[20px]" htmlFor="password">
        Contraseña
      </label>

      <div className="flex items-center justify-start gap-3">
        <input
          className="outline-none border-[#3B3440] rounded-2xl p-3 w-full bg-(--blackground) border-2 focus:bg-(--background) focus:text-(--black-color) transition-all"
          type={showPassword ? "text" : "password"}
          name="password"
          id="password"
          required
          value={formData.password}
          onChange={(e) => {
            setFetchResponse("");
            setUnauthorized(false);
            setFormData({ ...formData, password: e.target.value });
          }}
          placeholder="Crea tu contraseña..."
        />

        <button
          type="button"
          onClick={handlePassword}
          className="p-2 cursor-pointer text-2xl self-center rounded-2xl bg-(--background) text-(--blackground)"
        >
          {showPassword ? (
            <i className="fa-solid fa-eye-slash"></i>
          ) : (
            <i className="fa-solid fa-eye"></i>
          )}
        </button>
      </div>

      {fetchResponse === "notfound" && (
        <p className="w-full p-3 rounded-2xl text-center bg-(--red-color) text-xl mt-10">
          No se encontró la cuenta
        </p>
      )}

      {fetchResponse === "notpassword" && (
        <p className="w-full p-3 rounded-2xl text-center bg-yellow-700 text-xl mt-10">
          Contraseña incorrecta
        </p>
      )}

      {unauthorized && (
        <p className="w-full text-(--white-color) p-3 rounded-2xl text-center bg-red-600 text-xl mt-10">
          Inicio de sesión no autorizado
        </p>
      )}

      <button
        type="submit"
        className="transition-all w-full p-3 rounded-2xl bg-[linear-gradient(170deg,#ffffff,40%,#9b9b9b)] text-(--blackground) text-[20px] font-normal hover:scale-101 hover:shadow-[0_0px_15px_rgba(255,255,255,0.2)] mt-10 cursor-pointer"
      >
        Continuar
      </button>
    </form>
  );
}