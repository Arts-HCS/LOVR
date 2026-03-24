export default function Footer(){
    return(
        <div className="mt-auto w-full h-auto min-h-16 bg-(--black-color) flex flex-wrap items-center justify-start px-4 py-4 sm:p-8 gap-3 border-x border-[#3B3440] shadow-[0_-4px_30px_rgba(0,0,0,0.7)]">
            <h5 className="text-[12px] sm:text-[14px] text-(--gray-color)">&copy; 2026 Echo by LOVR. All rights reserved.</h5>
            <div className="ml-auto flex items-center gap-4 text-(--gray-color)">
                <a target="_blank" className="hover:text-(--white-color) transition-all" href="">
                    <i className="fa-brands fa-instagram text-xl sm:text-2xl"></i>
                </a>
                <a target="_blank" className="hover:text-(--white-color) transition-all" href="">
                    <i className="fa-brands fa-github text-xl sm:text-2xl"></i>
                </a>
                <a target="_blank" className="hover:text-(--white-color) transition-all" href="">
                    <i className="fa-brands fa-x-twitter text-xl sm:text-2xl"></i>
                </a>
            </div>
        </div>
    )
}