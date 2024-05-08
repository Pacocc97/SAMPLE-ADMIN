import NextImage from "next/image";
import type { Image } from "@prisma/client";

import { blurHashToDataURL } from "~/utils/decoder";
import { calculateHeight } from "~/utils/imageFunc";
import { env } from "../../env.mjs";

type Props = {
  image: Image;
  className?: string;
  width?: number;
};

const css = { maxWidth: "100%", height: "auto" };

export default function FixedImage({ width, image, className = "" }: Props) {
  return (
    <div className={className}>
      <NextImage
        alt="image"
        src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${image.path}/${image.original}`}
        placeholder="blur"
        blurDataURL={blurHashToDataURL(image.blur)}
        width={width || image.width}
        height={
          width
            ? calculateHeight(image.width, image.height, width)
            : image.height
        }
        style={css}
      />
    </div>
  );
}
