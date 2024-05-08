import { type ReactElement } from "react";

import PageComponent from "~/components/PageComponent";
import CreateProductForm from "~/components/forms/product/CreateProductForm";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="product"
      page="create"
      translate="producto"
      translatePage="crear"
      icon={<ProductBoxIcon className="h-full w-full" />}
    >
      <CreateProductForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
