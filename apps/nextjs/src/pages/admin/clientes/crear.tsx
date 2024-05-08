import type { ReactElement } from "react";
import { UsersIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateClientForm from "~/components/forms/client/CreateClientForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="client"
      page="create"
      translate="cliente"
      translatePage="crear"
      icon={<UsersIcon className="h-full w-full" />}
    >
      <CreateClientForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
