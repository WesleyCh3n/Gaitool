import axios from "axios";
import { ResData } from "../models/response_models";

export async function sendFile(f: File): Promise<ResData> {
  const formData = new FormData();
  formData.append("file", f);
  return axios
    .post("http://localhost:3001/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res["data"]["data"]);
}
