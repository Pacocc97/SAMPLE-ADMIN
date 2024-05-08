import type { UseFormRegister } from "react-hook-form";

import { UpdatePackageFormValues } from "@acme/api/src/schemas/packageSchema";
import type { UpdateProductFormValues } from "@acme/api/src/schemas/productSchema";
import { CreateSeoFormValues } from "@acme/api/src/schemas/seoSchema";

import TextFormElement from "../../elements/TextFormElement";
import { seoValues } from "../components/DescCamposSeo";

export const Twitter = ({
  getError,
  register,
}: {
  register: UseFormRegister<any>;
  getError: Function;
}) => {
  return (
    <div>
      <TextFormElement
        {...register("seo.twitterCard")}
        error={getError("seo", "twitterCard")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.twitterCard}
      </p>
      <TextFormElement
        {...register("seo.twitterSite")}
        error={getError("seo", "twitterSite")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.twitterSite}
      </p>
      <TextFormElement
        {...register("seo.twitterCreator")}
        error={getError("seo", "twitterCreator")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.twitterCreator}
      </p>
    </div>
  );
};
