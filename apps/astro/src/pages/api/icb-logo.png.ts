import { api } from "~/utils/api";

export async function get() {
  const icbLogo = (await api.image.showOriginal.query({original:'Logo-ICB-1200x1200px-paco.png'}));
  const response = await fetch(`https://d26xfdx1w8q2y3.cloudfront.net/${icbLogo?.path}/${
        icbLogo?.original
        }`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return new Response(buffer, {
    headers: { "Content-Type": "image/png" },
  });
}
