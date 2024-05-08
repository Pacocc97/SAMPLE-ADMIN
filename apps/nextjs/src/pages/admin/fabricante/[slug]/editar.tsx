import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import EditProducerForm from "~/components/forms/producer/EditProducerForm";

export default function Page() {
  const router = useRouter();
  const { slug } = router.query;
  const producer = trpc.producer.show.useQuery({ slug: slug as string });

  return (
    <PageComponent
      name="producer"
      page="update"
      translate="fabricante"
      translatePage="actualizar"
      icon={<BuildingOffice2Icon className="h-full w-full" />}
    >
      {!!producer.data && <EditProducerForm producer={producer.data as any} />}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
