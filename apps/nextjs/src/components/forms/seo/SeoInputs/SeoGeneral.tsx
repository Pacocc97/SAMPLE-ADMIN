import type { Control, UseFormRegister } from "react-hook-form";

import { UpdatePackageFormValues } from "@acme/api/src/schemas/packageSchema";
import { type CreateSeoFormValues } from "@acme/api/src/schemas/seoSchema";

import ParagraphFormElement from "../../elements/ParagraphFormElement";
import TextFormElement from "../../elements/TextFormElement";
import ToggleFormElement from "../../elements/ToggleFormElement";
import { seoValues } from "../components/DescCamposSeo";

type ObjSeo = {
  seo: CreateSeoFormValues;
};

export const SeoGeneral = ({
  getError,
  register,
  control,
}: {
  register: UseFormRegister<any>;
  control: Control<any>;
  getError: Function;
}) => {
  return (
    <div>
      <TextFormElement
        {...register("seo.title")}
        error={getError("seo", "title")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.title}
      </p>
      <ParagraphFormElement
        {...register("seo.descriptionMeta")}
        error={getError("seo", "descriptionMeta")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.descriptionMeta}
      </p>
      <TextFormElement
        {...register("seo.canonical")}
        error={getError("seo", "canonical")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.canonical}
      </p>
      <ToggleFormElement
        control={control}
        name="seo.noindex"
        error={getError("seo", "noindex")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.noindex}
      </p>
      <ToggleFormElement
        control={control}
        name="seo.nofollow"
        error={getError("seo", "nofollow")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.nofollow}
      </p>
      <TextFormElement
        {...register("seo.charset")}
        error={getError("seo", "charset")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.charset}
      </p>
    </div>
  );
};
