import { useRef } from "react";
import { saveConcat } from "../api/concater";
import Chart from "./Chart";

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
    <div className="flex-grow min-h-screen dark:bg-gray-800">
      <div className="grid grid-cols-2 mx-1 mt-4">
        <Chart ref={chartRef1} />
        <Chart ref={chartRef2} />
      </div>
      {
      /* <div
        className="flex flex-row items-end justify-evenly
        w-full m-0"
      >
        <button className="chart-btn" onClick={() => exportAllClick()}>
          Export All
        </button>
      </div> */
      }
    </div>
  );
};

export default DualChart;
