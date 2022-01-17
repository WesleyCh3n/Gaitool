import axios from "axios";

export type FilterdData = {
  [k: string]: string;
  Raw: string;
  Result: string;
  CyGt: string;
  CyLt: string;
  CyRt: string;
  CyDb: string;
};

export async function sendFile(f: File) {
  const formData = new FormData();
  formData.append("file", f);
  return axios.post("http://localhost:3001/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}
