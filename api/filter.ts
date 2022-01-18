import axios from "axios";

export type FilterdData = {
  [k: string]: any;
};

export async function sendFile(f: File) {
  const formData = new FormData();
  formData.append("file", f);
  return axios.post("http://localhost:3001/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then(res => res["data"]["data"])
}
