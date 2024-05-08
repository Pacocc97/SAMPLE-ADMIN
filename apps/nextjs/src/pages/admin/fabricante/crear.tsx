import type { ReactElement } from "react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateProducerForm from "~/components/forms/producer/CreateProducerForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="producer"
      page="create"
      translate="fabricante"
      translatePage="crear"
      icon={<BuildingOffice2Icon className="h-full w-full" />}
    >
      <CreateProducerForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
