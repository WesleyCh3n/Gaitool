import axios from "axios";
import { FilterdData } from "./filter"

export async function postRange(d: FilterdData, ranges: {}) {
  return await axios
    .post("http://localhost:3001/api/export", {
      RawFile: d.Raw,
      ResultFile: d.Rslt,
      GaitFile: d.CyGt,
      Ranges: ranges,
    })
    .then((res) => res["data"]["data"]);
}

export async function saveExport(filteredURL: FilterdData, ranges: {}) {
  let resExport = await postRange(filteredURL, ranges);
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
