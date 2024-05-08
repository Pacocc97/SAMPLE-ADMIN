import type { ReactElement } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateImageForm from "~/components/forms/image/CreateImageForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="image"
      page="create"
      translate="imagen"
      translatePage="crear"
      icon={<RectangleGroupIcon className="h-full w-full" />}
    >
      <CreateImageForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
