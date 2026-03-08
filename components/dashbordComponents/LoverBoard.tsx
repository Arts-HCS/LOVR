"use client";

import { useEffect, useState } from "react";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";

const TOTAL_STEPS = 3;

function ProgressBar({ progress, step }: { progress: number, step:number, lovrCreated: boolean }) {
    return (
      <div className={`w-full ${step === 4 ? "bg-[#5c5859] h-3" : "bg-[#4f3a3f] h-4"} transition-all duration-300 rounded-2xl`}>
        <div
          className={`h-full ${step === 4 ? "bg-[#e4dfe0]" : "bg-[#A9737F]"} rounded-2xl transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  }

export default function LoginFlow({ setOnBoardActive, activeUser, setLoverCreated }: { setOnBoardActive: (active: boolean) => void, activeUser: any, setLoverCreated: (active: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(()=>{
    if (step === 4){
      setProgress((TOTAL_STEPS / TOTAL_STEPS) * 100);
    } else{
      setProgress((step / TOTAL_STEPS) * 100);
    }
  }, [step])


  function nextStep() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <div className={`${step === 4 ? "w-[98%] left-2% bottom-2% h-[90%] border border-[#e4dfe049]" : "w-[92%] h-[85%] left-[4%] top-[10%]"}  flex flex-col rounded fixed ${step === 3 ? "bg-[#1c1d1fe3]": "bg-[#1c1d1f]"} z-10 shadow-2xl overflow-hidden p-5 transition-all duration-300`}>
      <ProgressBar progress={progress} step={step} />

      {step === 1 && <StepOne activeUser={activeUser} onNext={nextStep} setOnBoardActive={setOnBoardActive} />}
      {step === 2 && <StepTwo setStep={setStep} activeUser={activeUser} onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <StepThree onNext={nextStep} onBack={prevStep} activeUser={activeUser} setLoverCreated={setLoverCreated} />}
      {step === 4 && <StepFour setStep={setStep} onNext={nextStep} onBack={prevStep} activeUser={activeUser} />}
    </div>
  );
}
