export default function GeneratedTaskView({
  viewedTask,
  setViewedTask,
}: {
  viewedTask: any;
  setViewedTask: any;
}) {
  const { taskID, title, status, generated } = viewedTask;

  return (
    <div className="h-full w-full bg-[#F0F4F9] border-l border-t border-[#3B3440] flex flex-col">
      <h4 className="text-[22px] bg-[#d1d9e8] h-12 text-[#1f1f1e] border-b border-[#3A3F41] flex items-center justify-start px-6 shrink-0">
        {title}
      </h4>

      <div className="flex-1 flex flex-col items-center pt-10 pb-0">
        <textarea
          className="h-full w-200 shrink-0 bg-[#FFFFFF] outline-none border tex-left border-[#3A3E41] resize-none pt-22 px-18 text-[#1d1d1d] text-[15px] shadow-[0_4px_30px_rgba(0,0,0,0.2)] pb-20 border-b-0"
          id="generatedAnswer"
          value={generated}
          readOnly
        ></textarea>
      </div>
    </div>
  );
}
