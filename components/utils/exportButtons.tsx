"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useRef, useState } from "react";

type ExportType = "doc" | "slide";

interface ActiveUser {
  email?: string;
}
interface Props {
  title: string;
  content: any;
  type: ExportType;
  format?: "apa" | "mla";
  slidesVersion?: any;
  activeUser?: ActiveUser;
}

function ExportButton({
  title,
  content,
  type,
  format,
  slidesVersion,
  activeUser,
}: Props) {
  const endpoint = type === "doc" ? "/api/createDoc" : "/api/createSlides";
  const loginStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/drive.file",
    prompt: "consent",
    login_hint: activeUser?.email,
    onSuccess: (codeResponse: any) => {
      loginStarted.current = false;
      handleExport(codeResponse.code);
    },
    onError: (err: any) => {
      loginStarted.current = false;
      console.error(err);
    },
  } as any);

  const handleExport = async (code?: string) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code: code || null,
        title,
        content,
        format: format || null,
        activeUser: { email: activeUser?.email },
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.open(data.url, "_blank");
      return;
    }

    if (data.needsLogin) {
      if (data.reason === "account_mismatch") {
        setError(
          "Debes iniciar sesión con la misma cuenta de Google que usa esta sesión."
        );
        return;
      }

      if (!loginStarted.current) {
        loginStarted.current = true;
        googleLogin();
      }
    }
  };

  const isDisabled = type === "slide" && !slidesVersion;

  return (
    <div>
      <button
        onClick={() => !isDisabled && handleExport()}
        disabled={isDisabled}
        className={`px-2 py-2 w-full rounded-md text-left text-white text-[15px] font-medium transition-all duration-400
          ${
            type === "doc"
              ? "bg-[#4285F4] hover:bg-[#426bf4]"
              : slidesVersion
              ? "bg-[#F4B400] hover:bg-[#f4a300]"
              : "bg-[#76746d] cursor-not-allowed"
          }`}
      >
        {type === "doc" && format === "apa"
          ? "Exportar con formato APA"
          : type === "doc" && format === "mla"
          ? "Exportar con formato MLA"
          : type === "doc"
          ? "Google Docs"
          : "Google Slides"}

        {type === "doc" && format === "apa" ? (
          <i className="fa-solid fa-align-left ml-1"></i>
        ) : type === "doc" && format === "mla" ? (
          <i className="fa-solid fa-border-top-left ml-1"></i>
        ) : type === "doc" ? (
          <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
        ) : (
          <i className="fa-solid fa-chalkboard ml-1"></i>
        )}
      </button>

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

interface ExportGroupProps {
  title: string;
  content: string;
  slidesContent?: any;
  slidesVersion?: any;
  activeUser?: ActiveUser;
}

export default function ExportGroup({
  title,
  content,
  slidesContent,
  slidesVersion,
  activeUser,
}: ExportGroupProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="flex flex-col gap-2">
        <ExportButton
          title={title}
          content={content}
          type="doc"
          activeUser={activeUser}
        />

        <ExportButton
          title={title}
          content={content}
          type="doc"
          format="apa"
          activeUser={activeUser}
        />

        <ExportButton
          title={title}
          content={content}
          type="doc"
          format="mla"
          activeUser={activeUser}
        />

        <ExportButton
          title={title}
          content={slidesContent}
          type="slide"
          slidesVersion={slidesVersion}
          activeUser={activeUser}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
