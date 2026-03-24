function StepThree({
  onNext,
  onBack,
  activeUser,
  setLoverCreated,
}: {
  onNext: () => void;
  onBack: () => void;
  activeUser: any;
  setLoverCreated: (active: boolean) => void;
}) {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start mt-5 p-4 overflow-y-auto">
      <h3 className="text-2xl sm:text-3xl font-medium text-(--white-color) mb-7">
        ¡Todo listo!
      </h3>
      <p className="text-[15px] sm:text-[19px] text-[#bebebe] w-full sm:w-[90%]">
        No tengas miedo de hacer cambios: LOVR guarda una memoria de todos tus modelos, y puedes volver a uno específico en cualquier momento. <br /><br /> El mundo es tuyo, {activeUser.name.split(" ")[0]}.
      </p>

      <div className="w-full mt-auto flex items-center justify-end gap-3 sm:gap-5 pt-4">
        <button
          className="w-32 sm:w-40 h-10 text-(--white-color) bg-[#4f4346] cursor-pointer rounded flex items-center justify-center mt-5 hover:scale-95 transition-all"
          onClick={() => onBack()}
        >
          Regresar
        </button>
        <button
          onClick={() => setLoverCreated(true)}
          className="w-32 sm:w-40 h-10 bg-[#9d7880] text-(--white-color) rounded flex items-center justify-center mt-5 hover:scale-95 transition-all cursor-pointer"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}

export default StepThree;