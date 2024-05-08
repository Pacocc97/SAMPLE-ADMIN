import { type ReactElement } from "react";
import { SwatchIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateRoleForm from "~/components/forms/roles/CreateRolesForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="roles"
      page="create"
      translate="roles"
      translatePage="crear"
      icon={<SwatchIcon className="h-full w-full" />}
    >
      <CreateRoleForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
