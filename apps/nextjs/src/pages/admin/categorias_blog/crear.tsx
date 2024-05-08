import { type ReactElement } from "react";
import { ListBulletIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateBlogCategoryForm from "~/components/forms/blogCategory/CreateBlogCategoryForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="blogCategory"
      page="create"
      translate="Categoría de blog"
      translatePage="crear"
      icon={<ListBulletIcon className="h-full w-full" />}
    >
      <CreateBlogCategoryForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
