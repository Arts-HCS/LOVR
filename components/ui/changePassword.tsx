"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePassword(
    {   
        activeUser, 
        setUser,
        setPasswordChange
    }: 
    {
        activeUser: any, 
        setUser: (user: any) => void,
        setPasswordChange: (active: boolean) => void
        
    }) {
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{

        e.preventDefault();

        await fetch("/api/changePassword",{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: activeUser.id,
                password: newPassword
            })

        })

        setUser((prev:any)=>({
            ...prev,
            password: newPassword
        }))

        setPasswordChange(false);
    }
    return (
        <div className="p-4 rounded-xl shadow-[0_4px_5px_0_rgba(0,0,0,0.14),0_1px_10px_0_rgba(0,0,0,0.12),0_2px_4px_-1px_rgba(0,0,0,0.2)]
         border-[#323537] border bg-[#202225] z-100 w-[30%] h-fit absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h5 className="text-[18px] text-[#E4DFE0] mb-2">Cambiar contraseña</h5>
            <form onSubmit={(e)=> handleSubmit(e)} className="w-full h-fit flex items-start justify-start flex-col">
                <label className="text-[15px]" htmlFor="actualpsw">Tu contraseña actual</label>
                <input className="w-full p-1 border border-[#f0eeef83] rounded-sm mb-3 outline-none bg-[#333437] cursor-not-allowed" id="actualpsw" type="text" readOnly value={activeUser.password} />

                <label className="text-[15px]" htmlFor="newpsw">Nueva contraseña</label>
                <input className="w-full p-1 border border-[#F0EEEF83] rounded-sm outline-none" id="newpsw" type="text" placeholder="Tu nueva contraseña..." value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} />

                <button type="submit" className={`px-3 py-1 rounded-xl text-(--white-color)  transition-all mt-2 ${newPassword.length < 1 ? "bg-[#333437] pointer-events-none" : "bg-[#dc66469a] cursor-pointer"} ml-auto hover:scale-95`}>Cambiar</button>
            </form>

        </div>
    )
}