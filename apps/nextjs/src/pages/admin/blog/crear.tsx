import type { ReactElement } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";

import PageComponent from "~/components/PageComponent";
import CreateBlogForm from "~/components/forms/blog/CreateBlogForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  return (
    <PageComponent
      name="blog"
      page="create"
      translate="blog"
      translatePage="crear"
      icon={<RectangleGroupIcon className="h-full w-full" />}
    >
      <CreateBlogForm />
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
