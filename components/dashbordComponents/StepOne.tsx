import Link from "next/link";

function StepOne({ onNext, setOnBoardActive, activeUser }: { onNext: () => void, setOnBoardActive: (active: boolean) => void, activeUser: any }) {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start mt-5 p-4 overflow-y-auto">
      <h3 className="text-2xl sm:text-3xl font-medium text-(--white-color) mb-6">
        {activeUser.gender === "M" ? "Bienvenida a LOVR" : "Bienvenido a LOVR"}
      </h3>
      <p className="text-[15px] sm:text-[19px] text-[#bebebe] w-full sm:w-[90%]">
        LOVR es tu modelo de escritura y aprendizaje personalizado. Se adapta a tu forma de pensar, escribir y resolver problemas, mejorando con el tiempo.

        <br /><br />

        Puedes usarlo para:

        <br /><br />

        1. Compartir textos y/o ideas de los que te gustaría que tu LOVR aprendiera.
        <br />
        2. Hacer feedback inmediato, corrigiendo directamente las cosas que no te gustan sobre tu LOVR.
        <br />
        3. Integrarlo a proyectos que requieran recordar detalles específicos, hacer investigaciones, lluvia de ideas y cualquier otra tarea.

        <br /><br />

        Tu LOVR es único. Aprenderá automáticamente, pero también puedes acelerar su aprendizaje ajustándolo manualmente.

        <br /><br />

        El corazón en el centro del menú se tornará más rojo entre más se asemeje tu LOVR a ti.

        <br /><br />

        Si tienes preguntas sobre las políticas de privacidad, seguridad de usuario, configuración avanzada de LOVR y su uso, ingresa a <Link className="text-[#9d7880]" href={"/"}>este link</Link>.
      </p>
      <div className="w-full mt-auto flex items-center justify-end gap-3 sm:gap-5 pt-4">
        <button
          className="w-32 sm:w-40 h-10 text-(--white-color) bg-[#4f4346] cursor-pointer rounded flex items-center justify-center mt-5 hover:scale-95 transition-all"
          onClick={() => setOnBoardActive(false)}
        >
          Salir
        </button>
        <button
          onClick={onNext}
          className="w-32 sm:w-40 h-10 bg-[#9d7880] text-(--white-color) rounded flex items-center justify-center mt-5 hover:scale-95 transition-all cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default StepOne;