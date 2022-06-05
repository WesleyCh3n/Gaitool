import { useRef } from "react";
import { saveConcat } from "../api/concater";
import Chart from "./Chart"

const DualChart = () => {
  const chartRef1 = useRef<any>(null);
  const chartRef2 = useRef<any>(null);

  const exportAllClick = async () => {
    // export 2 csv
    if (!chartRef1.current.isSel() || !chartRef2.current.isSel()) {
      alert("Acquire 2 files selected range!");
      return;
    }
    let r1 = await chartRef1.current.getExportCSV();
    let r2 = await chartRef2.current.getExportCSV();
    await saveConcat(
      [r1, r2].map((d) => d["saveDir"] + "/" + d["python"]["ExportFile"]) as [
        string,
        string
      ]
    );
  };

  return (
    <div className="flex-grow ml-16">
      <div className="grid grid-cols-2 m-4 space-x-2">
        <Chart ref={chartRef1} />
        <Chart ref={chartRef2} />
      </div>
      <div className="fixed bottom-0 right-0 left-16 m-4 flex justify-center">
        <button onClick={() => exportAllClick()}>Export All</button>
      </div>
    </div>
  );
};

export default DualChart;

