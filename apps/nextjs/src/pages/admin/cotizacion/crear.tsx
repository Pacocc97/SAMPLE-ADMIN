import type { ReactElement } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreatePackageForm from "~/components/forms/packages/CreatePackageForm";
import CreateQuotationForm from "~/components/forms/quotation/CreateQuotationForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="quotation"
      page="create"
      translate="cotización"
      translatePage="crear"
      icon={<RectangleGroupIcon className="h-full w-full" />}
    >
      <CreateQuotationForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
