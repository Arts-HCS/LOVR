"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

interface Props {
  title: string;
  content: string;
  type: "doc" | "slide";
  format?: "apa" | "mla";
  slidesContent?: any;
  slidesVersion?: any;
  activeUser: any;
}

function ExportButton({ title, content, type, format, slidesVersion, activeUser }: Props) {
  const endpoint = type === "doc" ? "/api/createDoc" : "/api/createSlides";

  const handleExport = async (code?: string) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code: code || null, title, content, format: format || null, activeUser }),
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
    access_type: "offline",  
    prompt: "consent",
    onSuccess: (codeResponse) => handleExport(codeResponse.code),
    onError: (err) => console.error("Google login error:", err),
  });

  return (
    <button
      onClick={() => handleExport()}
      className={`px-2 py-2 rounded-md text-left text-white text-[15px] font-medium cursor-pointer transition-all duration-400 
        
        ${
        type === "doc" ? "bg-[#4285F4] hover:bg-[#426bf4]" : 
        slidesVersion ? "bg-[#F4B400] hover:bg-[#f4a300]" : "bg-[#76746d] hover:bg-[#43423e] cursor-default"
        
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
      <i className="fa-solid fa-align-left ml-1"></i> 
      : type === "doc" && format === "mla" ? 
      <i className="fa-solid fa-border-top-left ml-1"></i>  :
      type === "doc" && format === undefined ? 
      <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i> 
      : 
      <i className="fa-solid fa-chalkboard ml-1"></i>

      }
    </button>
  );
}

export default function ExportGroup({ title, content, slidesContent, slidesVersion, activeUser }: { title: string; content: string; slidesContent?: any, slidesVersion?: any, activeUser?: any }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="flex flex-col gap-2">
        <ExportButton title={title} content={content} type="doc" activeUser={activeUser} />
        <ExportButton title={title} content={content} type="doc" format="apa" activeUser={activeUser}/>
        <ExportButton title={title} content={content} type="doc" format="mla" activeUser={activeUser} />
        <ExportButton title={title} content={slidesContent} type="slide" slidesVersion={slidesVersion} activeUser={activeUser} />
        
      </div>
    </GoogleOAuthProvider>
  );
}