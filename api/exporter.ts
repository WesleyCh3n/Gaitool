import axios from "axios";
import { FltrFile } from "../models/file_models";
import { ResData, ResUpload } from "../models/response_models";

export async function postRange(
  f: FltrFile,
  rangeIndexes: {}[]
): Promise<ResData> {
  let req = {
    FltrFile: f,
    RangeIndex: rangeIndexes,
  };
  return await axios
    .put("http://localhost:3001/api/export", req)
    .then((res) => res["data"]["data"]);
}

export async function saveExport(r: ResUpload, rangeIndexes: {}[]) {
  let resExport = await postRange(r.python.FltrFile, rangeIndexes);
  let exportFileURL =
    resExport.serverRoot +
    "/" +
    resExport.saveDir +
    "/" +
    resExport.python["ExportFile"];
  let exportFileName = resExport.python["ExportFile"];
  await donwloadFile(exportFileURL, exportFileName);
}

export const saveRange = async (file: string, ranges: string) => {
  let response = await axios
    .patch("http://localhost:3001/api/save", {
      uploadFile: file,
      Range: ranges,
    })
    .then((res) => res["data"]["data"])
    .catch((err) => console.log(err.response.data.msg));
  let exportFileURL = response.serverRoot +
    "/" +
    response.saveDir +
    "/" +
    response.python["CleanFile"];
  await donwloadFile(exportFileURL, response.python["CleanFile"]);
};

export const donwloadFile = async (fileURL: string, filename: string) => {
  return await axios
    .get(fileURL, {
      responseType: "blob",
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    });
};
