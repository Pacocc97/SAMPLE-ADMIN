export async function get({ params }) {
  const fixedPath = params.path.replaceAll(" ", "/");
  // const response = await fetch(`http://localhost:3000/_next/image?url=https%3A%2F%2Fd26xfdx1w8q2y3.cloudfront.net%2Fdemo%2Fimages%2Fproduct%2Fimage%2FMicroscopio-Prisma-2003-03-.jpg&w=64&q=75`);
  // const response = await fetch(`https://d26xfdx1w8q2y3.cloudfront.net/${fixedPath}/${params.image}.${params.type}`);
  const response = await fetch(
    `${process.env.SERVER_URL}/_next/image?url=https://d26xfdx1w8q2y3.cloudfront.net/${fixedPath}/${params.image}.${params.type}&w=64&q=75`,
  );
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    body: JSON.stringify({
      body: buffer.toString("base64"),
      encoding: "binary",
    }),
  };
}
