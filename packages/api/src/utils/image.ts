import { PassThrough, Readable } from "stream";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { encode } from "blurhash";
import ffmpeg from "fluent-ffmpeg";
import sharp from "sharp";

interface Size {
  width?: number;
  height?: number;
}
ffmpeg.setFfmpegPath(ffmpegPath.path);

export function convertImage(
  image: Readable,
  outputFormat: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();
    ffmpeg()
      .input(image)
      .outputFormat(outputFormat)
      .on("error", reject)
      .stream(passthrough, { end: true });
    passthrough.on("data", (data) => chunks.push(data as Buffer));
    passthrough.on("error", reject);
    passthrough.on("end", () => {
      const originalImage = Buffer.concat(chunks);
      const editedImage = originalImage
        // copy everything after the last 4 bytes into the 4th position
        .copyWithin(4, -4)
        // trim off the extra last 4 bytes ffmpeg added
        .slice(0, -4);
      return resolve(editedImage);
    });
  });
}

export function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export function encodeImageToBlurhash(path: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    sharp(path)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err);
        resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 4));
      });
  });
}

export function resizeImage(image: Buffer, size: Size) {
  return sharp(image)
    .resize(size.width, size.height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer();
}
