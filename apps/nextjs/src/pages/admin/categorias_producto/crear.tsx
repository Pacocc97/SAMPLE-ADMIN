import { type ReactElement } from "react";
import { ListBulletIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateCategoryForm from "~/components/forms/category/CreateCategoryForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="category"
      page="create"
      translate="categoría"
      translatePage="crear"
      icon={<ListBulletIcon className="h-full w-full" />}
    >
      <CreateCategoryForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
