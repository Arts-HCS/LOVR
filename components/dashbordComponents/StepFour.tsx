import { compare } from "bcrypt";
import { use, useEffect, useState } from "react";

function ConfirmationBox({
 
  activeUser,
  allowedTexts,
  prohibited,
  setSendVerification,
  setStep
}: {
  activeUser: any;
  allowedTexts: any;
  prohibited: any;
  setSendVerification: any;
  onNext: any;
  setStep: any
}) {

  const saveDocuments = async () =>{
    const data = await fetch("/api/docSend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userID: activeUser.id,
        content: allowedTexts
      })
      
    })
    const resp = await data.json()

  }

  return (
    <div className="fixed right-[50%] transform translate-x-[50%] w-150 h-fit bg-[#1C1D1F] rounded-2xl p-9">
      <h3 className={`text-[26px] font-medium text-[#E4DFE0] mb-0`}>
        ¿Estás {activeUser.gender === "M" ? "segura" : "seguro"} de continuar?
      </h3>
      {allowedTexts.length === 0 && (
          <h4 className="mt-3">No hay textos compartidos</h4>
      )}
      {(prohibited.length === 0 && allowedTexts.length > 0) && (
        <>
          <p className={`text-[19px] text-[#bebebe] w-[88%] mt-4`}>
            Los siguientes textos serán utilizados para tu primera versión de
            LOVR:
          </p>
          <div className="w-full h-fit mt-5 flex flex-col gap-5">
            {allowedTexts.map((text: any, index: number) => (
              <div
                className="w-full max-h-12 rounded-2xl bg-[#363434] p-4 flex items-center justify-center"
                key={index}
              >
                <p className="truncate h-full w-full">{text}</p>
              </div>
            ))}
          </div>
          <p className={`text-[16px] text-[#bebebe] w-[88%] mt-4`}>
            Otros textos pudieron ser ignorados por no tener un mínimo de 100 palabras.
          </p>
        </>
      )}

      {prohibited.length > 0 && (
        <div className="w-full h-fit mt-2">
          <h5 className="text-[17px] text-[#bebebe] w-[88%] mt-4">
            Los siguientes textos son demasiado parecidos:
          </h5>
          <div className="w-full h-fit mt-5 flex flex-col gap-5">
            {prohibited.map((text: any, index: number) => (
              <div
                className="w-full max-h-12 rounded bg-[#985353c9] p-4 flex items-center justify-center"
                key={index}
              >
                <p className="truncate h-full w-full">{text.join(" ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="w-full mt-5 flex items-center justify-end gap-5">
        {(prohibited.length > 0) ?(
              <button
              className={`w-40 h-10 text-(--white-color) bg-[#4f4346] cursor-pointer rounded flex items-center justify-center mt-5    hover:scale-95 transition-all`}
              onClick={() => setSendVerification(false)}
            >
              Arreglar
            </button>
          ): (
            <>
            <button
          className={`w-40 h-10 text-(--white-color) bg-[#4f4346] cursor-pointer rounded flex items-center justify-center mt-5 hover:scale-95 transition-all`}
          onClick={() => setSendVerification(false)}
        >
          Regresar
        </button>

        {allowedTexts.length > 0 && (
            <button
            onClick={() =>{
              saveDocuments();
              setStep(2);
            }}
            className={`w-40 h-10 bg-[#9d7880] text-(--white-color)  rounded flex items-center justify-center mt-5 hover:scale-95 transition-all cursor-pointer`}
          >
            Continuar
          </button>
            
        )}
        
        </>

          )}
        
      </div>
    </div>
  );
}

export default function StepFour({
  setStep,
  onNext,
  onBack,
  activeUser,
  setStepFourCompleted
}: {
  setStep: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  activeUser: any;
  setStepFourCompleted: (active: boolean) => void
}) {
  const [sendVerification, setSendVerification] = useState(false);

  const [allowedTexts, setAllowedTexts] = useState([]);
  const [prohibited, setProhibited] = useState([]);

  const [texts, setTexts] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem("texts");
    return stored
      ? JSON.parse(stored)
      : {
          text1: "",
          text2: "",
          text3: "",
          text4: "",
          text5: "",
          text6: "",
          text7: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("texts", JSON.stringify(texts));
  }, [texts]);

  const handelDocSend = async () => {
    const allowedTexts: any = [];

    Object.keys(texts).forEach((text) => {
      if (texts[text].trim() === "" || texts[text].split(" ").length < 100)
        return;
      allowedTexts.push(texts[text.trim()]);
    });

    const repeatedTexts: any = [];

    let splittedTexts = allowedTexts.map((text) => text.split(" "));

    splittedTexts.forEach((currentText: any) => {
      splittedTexts.forEach((comparedText: any) => {
        if (currentText === comparedText) return;
        let count = 0;
        currentText.forEach((word) => {
          if (comparedText.includes(word)){
            count++ 
            return;
          } 
        });
        if (
          ((currentText.length > 100 && count > (currentText.length / 1.2)
           ) )
          
          &&
          !repeatedTexts.includes(currentText) &&
          !repeatedTexts.includes(comparedText)
        ) {
          repeatedTexts.push(currentText);
          repeatedTexts.push(comparedText);
        }
      });
    });

    setProhibited(repeatedTexts);

    setAllowedTexts(allowedTexts);
    setSendVerification(true);
    setStepFourCompleted(true)

  };

  return (
    <div className="w-full flex flex-col items-start justify-start mt-5 p-4 overflow-scroll relative mb-2">
      {sendVerification && (
        <>
          <div className="overlay"></div>
          <ConfirmationBox
            activeUser={activeUser}
            allowedTexts={allowedTexts}
            prohibited={prohibited}
            setSendVerification={setSendVerification}
            onNext={onNext}
            setStep={setStep}
          />
        </>
      )}
      <h3 className={`text-3xl font-medium text-(--white-color) mb-5`}>
        Versión 1.1
      </h3>

      <form className="w-full h-full flex flex-col items-start">
        <h4 className={`text-xl font-medium text-(--white-color)`}>
          Apartado A
        </h4>
        <p className={`text-[17px] text-[#bebebe] w-[88%] mt-4`}>
          En este apartado podrás compartir textos que hayas escrito antes. Se
          recomienda que sean cercanos a tu estilo de escritura actual y que
          sean en su totalidad escritos por ti. <br /> Puedes agregar ensayos,
          correos, cuentos y cualquier otra forma de escritura diferente a un
          poema. También puedes añadir fragmentos de artículos, libros o
          cualquier otro material cuyo estilo también te gustaría incluir.{" "}
          <br /> Todos los textos permanecerán guardados al salir de la página.
        </p>
        <label
          htmlFor="text1"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          Primer texto
        </label>
        <textarea
          name="text1"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-40 resize-none mb-2 shadow border border-[#eee7e959]"
          id="text1"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text1: e.target.value }))
          }
          value={texts.text1}
          placeholder="Ingresa tu primer texto..."
        ></textarea>
        <label
          htmlFor="text2"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          Segundo texto
        </label>
        <textarea
          name="text2"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-40 resize-none mb-2 shadow border border-[#eee7e959]"
          id="text2"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text2: e.target.value }))
          }
          value={texts.text2}
          placeholder="Ingresa el segundo texto..."
        ></textarea>
        <label
          htmlFor="text3"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          Tercer texto
        </label>
        <textarea
          name="text3"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-40 resize-none mb-2 shadow border border-[#eee7e959]"
          id="text3"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text3: e.target.value }))
          }
          value={texts.text3}
          placeholder="Ingresa el tercer texto..."
        ></textarea>

        <h4 className={`text-xl font-medium text-(--white-color) mt-18`}>
          Apartado B
        </h4>
        <p className={`text-[17px] text-[#bebebe] w-[88%] mt-4`}>
          Este apartado consiste en contestar al menos una de las siguientes
          preguntas. Es importante que estas respuestas sean tuyas completamente
          y que cuenten con respuestas justificadas. <br /> Se pide un mínimo de
          100 palabras por cada pregunta escogida. <br /> Tú decides el formato
          del texto, qué escribir primero y cómo explicar las cosas. No hay
          formato ni reestricciones.
        </p>
        <label
          htmlFor="text4"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          ¿Qué es lo que nos hace humanos?
        </label>
        <textarea
          name="text4"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-30 resize-none mb-2 shadow border border-[#eee7e959]"
          id="text4"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text4: e.target.value }))
          }
          value={texts.text4}
          placeholder="Algo complejo después de todo..."
        ></textarea>
        <label
          htmlFor="text5"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          ¿Cuál es la mejor forma de morir? ¿Por qué?
        </label>
        <textarea
          name="text5"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-30 resize-none mb-2 shadow border border-[#eee7e959]"
          id="text5"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text5: e.target.value }))
          }
          value={texts.text5}
          placeholder="Tantas formas..."
        ></textarea>
        <label
          htmlFor="text6"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          Si el mundo se acabara dentro de dos días, ¿cómo aprovecharías el
          tiempo restante?
        </label>
        <textarea
          name="text6"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-30 resize-none mb-2 shadow border border-[#eee7e959]"
          id="text6"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text6: e.target.value }))
          }
          value={texts.text6}
          placeholder="48 horas pueden ser una vida entera..."
        ></textarea>
        <label
          htmlFor="text7"
          className="mt-4 mb-2 text-[18px] text-(--white-color) font-medium"
        >
          ¿Cómo se siente estar{" "}
          {activeUser.gender === "M" ? "enamorada" : "enamorado"}?
        </label>
        <textarea
          name="text7"
          className="w-[88%] outline-none p-3 text-[16px] bg-[#2c2c2c] rounded min-h-30 resize-none mb-10 shadow border border-[#eee7e959]"
          id="text7"
          onChange={(e) =>
            setTexts((prev) => ({ ...prev, text7: e.target.value }))
          }
          value={texts.text7}
          placeholder={
            activeUser.gender === "M"
              ? "Humana después de todo..."
              : "Humano después de todo..."
          }
        ></textarea>
      </form>

      {!sendVerification && (
        <div className="w-fit mt-auto fixed bottom-15 right-8 flex flex-col items-end justify-end ">
          <button
            className={`w-40 h-10 text-(--black-color) bg-[#e4dfe0] cursor-pointer rounded flex items-center justify-center hover:scale-95 transition-all`}
            onClick={() => handelDocSend()}
          >
            Continuar
          </button>
          <button
            className={`w-40 h-10 text-[#e4dfe0] bg-[#363434] cursor-pointer rounded flex items-center justify-center mt-3 hover:scale-95 transition-all`}
            onClick={() => setStep(2)}
          >
            Regresar
          </button>
        </div>
      )}
    </div>
  );
}
