import type { Control, UseFormRegister } from "react-hook-form";

import { UpdatePackageFormValues } from "@acme/api/src/schemas/packageSchema";
import type { UpdateProductFormValues } from "@acme/api/src/schemas/productSchema";
import { CreateSeoFormValues } from "@acme/api/src/schemas/seoSchema";

import TagsElement from "../../elements/TagsFormElement";
import TextFormElement from "../../elements/TextFormElement";
import { seoValues } from "../components/DescCamposSeo";

export const OpenGraphArticle = ({
  getError,
  register,
  control,
}: {
  getError: Function;
  register: UseFormRegister<any>;
  control: Control<any>;
}) => {
  return (
    <div>
      <TextFormElement
        {...register("seo.openGraphArticleAuthor")}
        error={getError("seo", "openGraphArticleAuthor")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphArticleAuthor}
      </p>
      <TextFormElement
        {...register("seo.openGraphArticleSection")}
        error={getError("seo", "openGraphArticleSection")}
      />
      <p className="mb-4 mt-[-40px] px-2 text-sm text-slate-600 dark:text-slate-400">
        {seoValues.openGraphArticleSection}
      </p>
      <TagsElement
        control={control}
        name="seo.openGraphArticleTags"
        error={getError("seo", "openGraphArticleTags")}
      />
      <p className="px-2 text-xs">Presione Enter para agregar</p>
      <p className="px-2 text-xs">{seoValues.openGraphArticleTags}</p>
    </div>
  );
};
