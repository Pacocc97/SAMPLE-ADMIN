import type { Dispatch, RefObject, SetStateAction } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { Size } from "~/types/types";
import ImageFormElement from "../../elements/ImageFormElement";
import TextFormElement from "../../elements/TextFormElement";
import { seoValues } from "../components/DescCamposSeo";

type Handle = {
  reset: () => void;
};

export const OpenGraphBasic = ({
  getError,
  register,
  imageOpError,
  sizeOp,
  baseOpImage,
  setBaseOpImage,
  setFileName,
  setAltImage,
altImage,
  imageOpRef,
}: {
  register: UseFormRegister<any>;
  getError: Function;
  imageOpError: string | undefined;
  sizeOp: Size;
  baseOpImage: string | undefined;
  setFileName?:Dispatch<SetStateAction<string | undefined>>;
  setBaseOpImage: Dispatch<SetStateAction<string | undefined>>;
  imageOpRef: RefObject<Handle>;
  setAltImage?: Dispatch<SetStateAction<string | null | undefined>>;
  altImage?: string | null;
}) => {
  return (
    <div>
      <TextFormElement
        {...register("seo.openGraphBasicTitle")}
        error={getError("seo", "openGraphBasicTitle")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphBasicTitle}
      </p>
      <TextFormElement
        {...register("seo.openGraphBasicType")}
        error={getError("seo", "openGraphBasicType")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphBasicType}
      </p>

      <ImageFormElement
        name="seo.openGraphBasicImage"
        error={imageOpError}
        size={sizeOp}
        image={baseOpImage}
        setImage={setBaseOpImage}
        ref={imageOpRef}
        setFileName={setFileName}
        setAltImage={setAltImage}
        altImage={altImage}
      />
      <p className="mb-4 mt-[-8px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphBasicImage}
      </p>
      <TextFormElement
        {...register("seo.openGraphBasicUrl")}
        error={getError("seo", "openGraphBasicUrl")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphBasicUrl}
      </p>
    </div>
  );
};
