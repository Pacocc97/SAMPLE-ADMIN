import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";

import { type Image, type Product, type ProductPackage, type Seo } from "@acme/db";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import EditPackageForm from "~/components/forms/packages/EditPackageForm";

type ProductPack = ProductPackage & {
  image: Image | null;
  seo: Seo & {
    openGraphBasicImage?: Image | null;
  };
  products: (Product & {
    image: Image;
  })[];
};
export default function Page() {
  const router = useRouter();
  const { slug } = router.query;
  const productPackage = trpc.package.show.useQuery({ slug: slug as string });
  return (
    <PageComponent
      name="package"
      page="update"
      translate="Paquete"
      translatePage="actualizar"
      icon={<BuildingOffice2Icon className="h-full w-full" />}
    >
      {!!productPackage.data && (
        <EditPackageForm productPackage={productPackage.data as ProductPack} />
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
