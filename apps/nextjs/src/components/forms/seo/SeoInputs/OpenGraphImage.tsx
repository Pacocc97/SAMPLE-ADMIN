import type { UseFormRegister } from "react-hook-form";

import { UpdatePackageFormValues } from "@acme/api/src/schemas/packageSchema";
import type { UpdateProductFormValues } from "@acme/api/src/schemas/productSchema";
import { CreateSeoFormValues } from "@acme/api/src/schemas/seoSchema";

import NumberFormElement from "../../elements/NumberFormElement";
import TextFormElement from "../../elements/TextFormElement";
import { seoValues } from "../components/DescCamposSeo";

export const OpenGraphImage = ({
  getError,
  register,
}: {
  register: UseFormRegister<any>; //UseFormRegister<UpdatePackageFormValues>;
  getError: Function;
}) => {
  return (
    <div>
      <TextFormElement
        {...register("seo.openGraphImageUrl")}
        error={getError("seo", "openGraphImageUrl")}
        dangerous={true}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphImageUrl}
      </p>
      <TextFormElement
        {...register("seo.openGraphImageSecureUrl")}
        error={getError("seo", "openGraphImageSecureUrl")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphImageSecureUrl}
      </p>
      <TextFormElement
        {...register("seo.openGraphImageType")}
        error={getError("seo", "openGraphImageType")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphImageType}
      </p>
      <NumberFormElement
        {...register("seo.openGraphImageWidth", {
          // valueAsNumber: true,
        })}
        error={getError("seo", "openGraphImageWidth")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphImageWidth}
      </p>
      <NumberFormElement
        {...register("seo.openGraphImageHeight", {
          // valueAsNumber: true,
        })}
        error={getError("seo", "openGraphImageHeight")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphImageHeight}
      </p>
      <TextFormElement
        {...register("seo.openGraphImageAlt")}
        error={getError("seo", "openGraphBasicUrl")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphImageAlt}
      </p>
    </div>
  );
};
