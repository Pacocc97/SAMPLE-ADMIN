import { type NextApiRequest, type NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL as string}/_next/image?url=https%3A%2F%2Fd26xfdx1w8q2y3.cloudfront.net%2Fimages%2F%2FLogo-ICB-1200x1200px-paco.png&w=384&q=75`
    );
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.end(buffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch and serve the image." });
  }
}