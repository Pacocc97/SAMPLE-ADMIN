import NextImage from "next/image";
import { type Image } from "@prisma/client";

import { blurHashToDataURL } from "~/utils/decoder";
import { classNames } from "~/utils/object";
import { env } from "~/env.mjs";

type Props = {
  image: Image;
  className?: string;
};

export default function DynamicImage({ image, className = "" }: Props) {
  return (
    <div className={classNames("relative w-full", className)}>
      <NextImage
        alt="image"
        src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${image.path}/${image.original}`}
        placeholder="blur"
        blurDataURL={blurHashToDataURL(image.blur)}
        sizes="100vw"
        fill
        objectFit="contain"
      />
    </div>
  );
}
