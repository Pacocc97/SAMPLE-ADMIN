import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import EditClientForm from "~/components/forms/client/EditClientForm";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;
  const { data: users } = trpc.users.show.useQuery({ id: id as string });

  return (
    <PageComponent
      name="client"
      page="update"
      translate="cliente"
      translatePage="actualizar"
      icon={<UserCircleIcon className="h-full w-full" />}
    >
      {!!users && <EditClientForm client={users} />}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
