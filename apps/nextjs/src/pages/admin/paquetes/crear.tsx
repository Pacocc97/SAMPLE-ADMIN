import type { ReactElement } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreatePackageForm from "~/components/forms/packages/CreatePackageForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="package"
      page="create"
      translate="Paquetes"
      translatePage="crear"
      icon={<RectangleGroupIcon className="h-full w-full" />}
    >
      <CreatePackageForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
