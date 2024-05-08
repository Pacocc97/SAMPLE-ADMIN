import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@layouts/AdminLayout";
import type { Category, Image } from "@prisma/client";
import { useSession } from "next-auth/react";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import EditProductForm from "~/components/forms/product/EditProductForm";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";

export default function Page() {
  const { data: session } = useSession({ required: true });
  const router = useRouter();
  const { slug } = router.query;
  const datosExtra = router.query;
  const utils = trpc.useContext();
  const { data: productData } = trpc.product.show.useQuery({
    slug: slug as string,
  });
  const { data: producerData } = trpc.producer.all.useQuery();
  const { data: categoryData } = trpc.category.all.useQuery();
  const type = trpc.type.all.useQuery();
  const unit = trpc.unit.all.useQuery();
  const { mutate: setApproval } = trpc.product.authorize.useMutation({
    async onSuccess() {
      await utils.product.show.invalidate();
    },
    async onError(e) {
      await Toast.fire({
        title: e.message,
        icon: "error",
      });
    },
  });
  const userApproved = "admin" || "seo" || "design";
  const typeOptions = type.data?.map((type) => ({
    id: type.name,
    name: type.name,
  }));
  const unitOptions = unit.data?.map((unit) => ({
    id: unit.name,
    name: unit.name,
  }));
  const categoryOptions = categoryData?.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    characteristics: category.characteristics,
    parent: category.parent,
    child: category.child,
    imageId: category.imageId,
    image: category.image,
  }));
  const catIds = productData?.Category?.map((cat) => cat.id);
  const catOrder = categoryOptions
    ? categoryOptions.filter((cat) => catIds?.includes(cat.id))
    : [];

  /**
   * Approve product depending on user role.
   */
  async function approvedHandler() {
    if (
      productData &&
      session &&
      session.user &&
      session.user.role === ("admin" || "seo" || "design")
    ) {
      const typeUsuario = session.user.role;
      const userId = session.user.id;
      const mensaje = () => {
        if (typeUsuario === "admin") {
          return productData?.approval.includes("admin")
            ? {
                title: "Desaprobar product",
                text: "Se pausará la publicación del product",
              }
            : {
                title: "Aprobar product",
                text: "Se publicará el product",
              };
        } else {
          return productData?.approval.includes(`${typeUsuario as string}`)
            ? {
                title: `Disentir`,
                text: `Disentir información del ${typeUsuario as string}`,
              }
            : {
                title: "Verificar",
                text: `Verificar información del ${typeUsuario as string}`,
              };
        }
      };
      await ConfirmModal.fire({
        title: mensaje().title,
        text: mensaje().text,
        confirmButtonColor: "#039487",
        confirmButtonText: "Sí!",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed && userId) {
          setApproval({
            id: productData.id,
            role: typeUsuario,
            prevAuth: productData.approval,
            user: userId,
          });
        }
      });
    }
  }

  /**
   * Reduces the categories structure for future sorting.
   * Puts id as index value.
   *
   * @returns {Record<string, Category>} m
   */
  const sectionsMap: Record<string, Category> = catOrder.reduce(
    (m: Record<string, Category>, o: Category) => {
      m[o.id] = o;
      return m;
    },
    {},
  );

  /**
   * Compares id values and parentId values for future sorting, based on those raltions.
   *
   * @param {Category} a
   * @param {Category} b
   * @returns {number}
   */
  function compare(a: Category, b: Category): number {
    if (a.parentId !== null && !sectionsMap?.[a.parentId]) {
      return -1;
    } else if (sectionsMap?.[a.parentId as string]?.id === b.id) {
      return 1;
    } else {
      if (a.parentId) {
        return compare(sectionsMap[a.parentId] as Category, b);
      } else {
        return 1;
      }
    }
  }

  /**
   * Applies "compare" to sort categories.
   */
  const categories = catOrder?.sort(compare);

  /**
   * Sorts images by orden value.
   */
  const sortedProducts = productData?.ImagesExtra.sort((p1, p2): number => {
    if (p1.orden !== null && p2.orden !== null) {
      return p1.orden - p2.orden;
    } else {
      return 0;
    }
  });

  return (
    <PageComponent
      name="product"
      translate="producto"
      page="update"
      translatePage="actualizar"
      icon={<ProductBoxIcon className="h-full w-full" />}
    >
      {userApproved && (
        <div className="mb-10">
          <button
            className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => approvedHandler()}
          >
            {productData?.approval.includes("admin") ? "DESAPROBAR" : "APROBAR"}
          </button>
          <h1 className="mb-5">
            Producto: <strong>{productData?.name}</strong>
          </h1>
        </div>
      )}
      {!!productData && (
        <EditProductForm
          producerData={producerData}
          product={productData as any}
          category={categoryOptions}
          misCat={categories}
          paso={datosExtra.paso}
          seoSec={datosExtra.seoSec}
          type={typeOptions}
          unit={unitOptions}
          sortedProducts={sortedProducts}
        />
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
