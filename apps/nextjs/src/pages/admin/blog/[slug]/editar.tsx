import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";

import { type Blog, type Image, type Seo } from "@acme/db";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import EditBlogForm from "~/components/forms/blog/EditBlogForm";

type BlogType = Blog & {
  image: Image | null;
  seo: Seo & {
    openGraphBasicImage?: Image | null;
  };
};
export default function Page() {
  const router = useRouter();
  const { slug } = router.query;
  const blog = trpc.blog.show.useQuery({ slug: slug as string });
  return (
    <PageComponent
      name="blog"
      page="update"
      translate="Blog"
      translatePage="actualizar"
      icon={<BuildingOffice2Icon className="h-full w-full" />}
    >
      {!!blog.data && <EditBlogForm blog={blog.data as any} />}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
