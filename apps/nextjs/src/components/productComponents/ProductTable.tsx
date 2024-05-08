import Link from "next/link";
import type { Category, Image, Product } from "@prisma/client";

import FixedImage from "~/components/images/FixedImage";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";

type MyProduct = Product & {
  Category?: Category[] | null;
  image: Image;
};

export default function ProductTable(products: MyProduct[]) {
  /**
   * Changes passed value to price format.
   *
   * @param {Product} value
   * @returns
   */
  function formatoPrecio(value: Product) {
    let valorNuevo = value.price;
    return (valorNuevo /= 100).toLocaleString("es-MX", {
      style: "currency",
      currency: `${value.currency ? value.currency : ""}`,
    });
  }

  // const obj:<Record<string, string | number | unkown>> = {
  //   'depende de lo que quieras filtrar': 'valor filtrado',
  // };

  return (
    <>
      <TableElement>
        <TableHead>
          <TableHeadCol>imagen</TableHeadCol>
          <TableHeadCol>nombre</TableHeadCol>
          <TableHeadCol>categoría</TableHeadCol>
          <TableHeadCol>
            {/* TRES CLICKS DEFAULT */}
            precio
          </TableHeadCol>
        </TableHead>
        <TableBody>
          {products?.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="h-24 content-center bg-slate-800 text-center "
              >
                <span className="text-2xl font-bold">Sin productos</span>
              </td>
            </tr>
          ) : (
            products?.map((product) => (
              <TableRow key={product.id}>
                <TableData>
                  <span title={product.slug}>
                    <FixedImage
                      image={product.image}
                      className="h-8 w-8 rounded-full"
                    />
                  </span>
                </TableData>
                <TableData>
                  <Link
                    href={`/admin/producto/${product.slug}`}
                    className="font-bold hover:text-black dark:hover:text-white"
                  >
                    {product.name}
                  </Link>
                </TableData>
                <TableData>
                  {product.Category && product.Category.length !== 0
                    ? product.Category?.filter(
                        (cat) => cat.parentId === null,
                      ).map((cat) => cat.name)
                    : "Sin categoría"}
                </TableData>
                <TableData>{formatoPrecio(product)}</TableData>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableElement>
    </>
  );
}
