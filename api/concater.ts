import axios from "axios";

export async function postCSVs(files: [string, string]) {
  const res = await axios.post("http://localhost:3001/api/concat", {
    files: files,
  });
  return res["data"]["data"];
}

export async function saveConcat(files: [string, string]) {
  let resConcat = await postCSVs(files);
  let concatFileURL =
    resConcat["serverRoot"] +
    "/" +
    resConcat["saveDir"] +
    "/" +
    resConcat["python"]["ConcatFile"];
  let exportFileName = resConcat["python"]["ConcatFile"];
  await axios
    .get(concatFileURL, {
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
