import type { UseFormRegister } from "react-hook-form";

import { UpdatePackageFormValues } from "@acme/api/src/schemas/packageSchema";
import type { UpdateProductFormValues } from "@acme/api/src/schemas/productSchema";
import { CreateSeoFormValues } from "@acme/api/src/schemas/seoSchema";

import ParagraphFormElement from "../../elements/ParagraphFormElement";
import TextFormElement from "../../elements/TextFormElement";
import { seoValues } from "../components/DescCamposSeo";

export const OpenGraphOptional = ({
  getError,
  register,
}: {
  register: UseFormRegister<any>;
  getError: Function;
}) => {
  return (
    <div>
      <TextFormElement
        {...register("seo.openGraphOptionalAudio")}
        error={getError("seo", "openGraphOptionalAudio")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalAudio}
      </p>
      <ParagraphFormElement
        {...register("seo.openGraphOptionalDescription")}
        error={getError("seo", "openGraphOptionalDescription")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalDescription}
      </p>
      <TextFormElement
        {...register("seo.openGraphOptionalDeterminer")}
        error={getError("seo", "openGraphOptionalDeterminer")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalDeterminer}
      </p>
      <TextFormElement
        {...register("seo.openGraphOptionalLocale")}
        error={getError("seo", "openGraphOptionalLocale")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalLocale}
      </p>
      <TextFormElement
        {...register("seo.openGraphOptionalLocaleAlternate")}
        error={getError("seo", "openGraphOptionalLocaleAlternate")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalLocaleAlternate}
      </p>
      <TextFormElement
        {...register("seo.openGraphOptionalSiteName")}
        error={getError("seo", "openGraphOptionalSiteName")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalSiteName}
      </p>
      <TextFormElement
        {...register("seo.openGraphOptionalVideo")}
        error={getError("seo", "openGraphOptionalVideo")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphOptionalVideo}
      </p>
    </div>
  );
};
