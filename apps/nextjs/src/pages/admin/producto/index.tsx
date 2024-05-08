import type { ReactElement } from "react";
import { AdminLayout } from "@layouts/AdminLayout";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import ProductsTable from "~/components/ProductsTable";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";

export default function Page() {
  const products = trpc.product.all.useQuery();

  return (
    <PageComponent
      name="product"
      page="list"
      translate="producto"
      translatePage="lista"
      hasData={products.data && products.data.length > 0}
      icon={<ProductBoxIcon className="h-full w-full" />}
    >
      <ProductsTable />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
