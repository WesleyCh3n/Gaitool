import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  msg?: string;
  error?: string;
};

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

// call api with body and return json
export default async function upload(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // https://stackoverflow.com/questions/60020241/next-js-file-upload-via-api-routes-formidable-not-working
  const result = await fetch("http://127.0.0.1:3001/api/upload", {
    method: "POST",
    body: req.body,
  }).then((res) => res.json());

  res.status(200).json({ msg: result });
}

