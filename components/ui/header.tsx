import Link from "next/link"

export default function Header({loginBtn}: {loginBtn:boolean}){
    return(
        <div className="w-full h-auto min-h-16 bg-(--black-color) border-x border-[#3B3440] shadow-[0_4px_30px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-start px-4 sm:px-8 py-3 gap-y-2">
            <h1 className="text-2xl sm:text-3xl font-medium text-(--white-color)">
                Echo
                <span className="text-[13px] sm:text-[15px] ml-1.5 lovr-color">by LOVR</span>
            </h1>
            <div className="ml-auto flex flex-wrap items-center gap-3 sm:gap-5">
                {loginBtn && (
                    <Link className={"link text-sm sm:text-base mr-0 sm:mr-10"} href={"/login"}>¿Ya tienes una cuenta?</Link>
                )}
            </div>
        </div>
    )
}