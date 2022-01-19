import axios from "axios";
import { FilterdData } from "./filter"

export async function postRange(f: FilterdData, ranges: {}[]) {
  return await axios
    .post("http://localhost:3001/api/export", {
      FltrFile: f,
      Range: ranges,
    })
    .then((res) => res["data"]["data"]);
}

export async function saveExport(fltrFile: FilterdData, ranges: {}[]) {
  let resExport = await postRange(fltrFile, ranges);
  let exportFileURL =
    resExport["serverRoot"] +
    "/" +
    resExport["saveDir"] +
    "/" +
    resExport["python"]["ExportFile"];
  let exportFileName = resExport["python"]["ExportFile"];
  await axios
    .get(exportFileURL, {
      responseType: "blob",
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", exportFileName);
      document.body.appendChild(link);
      link.click();
    });
}
