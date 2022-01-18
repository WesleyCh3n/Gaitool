import type { NextPage } from "next";
import { useRef } from "react";
import Chart from "./Chart";
import { saveConcat } from "../api/concater";

const Home: NextPage = () => {
  const chartRef1 = useRef<any>(null);
  const chartRef2 = useRef<any>(null);

  const exportAllClick = async () => {
    // export 2 csv
    let r1 = await chartRef1.current.getExportCSV();
    let r2 = await chartRef2.current.getExportCSV();
    if (!r1 || !r2) {
      alert("Acquire 2 files selected range!");
      return;
    }
    await saveConcat(
      [r1, r2].map((d) => d["saveDir"] + "/" + d["python"]["ExportFile"]) as [
        string,
        string
      ]
    );
  };

  return (
    <div>
      <div className="m-4 flex justify-center space-x-2">
        <Chart ref={chartRef1} />
        <Chart ref={chartRef2} />
      </div>
      <div className="m-4 flex justify-end">
        <button onClick={() => exportAllClick()}>Export All</button>
      </div>
    </div>
  );
};

export default Home;
