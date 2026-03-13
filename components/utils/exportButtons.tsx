"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

interface Props {
  title: string;
  content: string;
  type: "doc" | "slide";
  format?: "apa" | "mla";
}

function ExportButton({ title, content, type, format }: Props) {
  const endpoint = type === "doc" ? "/api/createDoc" : "/api/createSlides";

  const handleExport = async (code?: string) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code || null, title, content, format: format || null }),
    });

    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    } else if (data.needsLogin) {
      googleLogin();
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/presentations",
    onSuccess: (codeResponse) => handleExport(codeResponse.code),
  });

  return (
    <button
      onClick={() => handleExport()}
      className={`px-4 py-2 rounded-md text-left text-white font-medium cursor-pointer transition-all duration-400 ${
        type === "doc" ? "bg-[#4285F4] hover:bg-[#426bf4]" : "bg-[#F4B400] hover:bg-[#f4a300]"
      }`}
    >
      {type === "doc" && format === "apa" ? 
        "Exportar con formato APA"
      : type === "doc" && format === "mla" ? 
       "Exportar con formato MLA" :
       type === "doc" && format === undefined ?
       "Google Docs" :
       "Google Slides"

      }
      {type === "doc" && format === "apa" ? 
      <i className="fa-solid fa-align-left ml-2"></i> 
      : type === "doc" && format === "mla" ? 
      <i className="fa-solid fa-border-top-left ml-2"></i>  :
      type === "doc" && format === undefined ? 
      <i className="fa-solid fa-arrow-up-right-from-square ml-2"></i> 
      : 
      <i className="fa-solid fa-chalkboard ml-2"></i>

      }
    </button>
  );
}

export default function ExportGroup({ title, content }: { title: string; content: string }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="flex flex-col gap-2">
        <ExportButton title={title} content={content} type="doc" />
        <ExportButton title={title} content={content} type="doc" format="apa" />
        <ExportButton title={title} content={content} type="doc" format="mla" />
        <ExportButton title={title} content={content} type="slide" />
        
      </div>
    </GoogleOAuthProvider>
  );
}