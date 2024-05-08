import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@layouts/AdminLayout";
import type { Category, Image } from "@prisma/client";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import EditCategoryForm from "~/components/forms/category/EditCategoryForm";
import BlockChainIcon from "~/components/icons/BlockChainIcon";

type WholeCategory = Category & {
  image?: Image;
};

export default function Page() {
  const router = useRouter();
  const { slug } = router.query;
  const category = trpc.category.show.useQuery({ slug: slug as string });
  return (
    <PageComponent
      name="category"
      page="update"
      translate="categoría"
      translatePage="actualizar"
      icon={<BlockChainIcon className="h-full w-full" />}
    >
      {!!category.data && (
        <EditCategoryForm category={category.data as any} />
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
