import axios from "axios";

type FilterdData = {
  [k: string]: any;
};

export async function saveExport(resFilterD: FilterdData, ranges: {}) {
  let resExport = await axios
    .post("http://localhost:3001/api/export", {
      RawFile: resFilterD.Raw,
      ResultFile: resFilterD.Rslt,
      GaitFile: resFilterD.CyGt,
      Ranges: ranges,
    })
    .then((res) => res["data"]["data"]);
  console.log(resExport);
  let exportFileURL =
    resExport["prefix"] + "/" + resExport["python"]["ExportFile"];
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
