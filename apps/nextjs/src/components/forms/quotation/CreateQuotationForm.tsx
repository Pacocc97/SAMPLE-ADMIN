import { useState } from "react";
import Image from "next/image";
import { Switch } from "@headlessui/react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useForm } from "react-hook-form";

import {
  createQuoteFormSchema,
  type CreateQuoteFormValues,
} from "@acme/api/src/schemas/quoteSchema";
import {
  type Address,
  type Image as ImageType,
  type Product,
  type Role,
  type User,
} from "@acme/db";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import ProductsTable from "~/components/ProductsTable";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import { env } from "~/env.mjs";
import ComboboxUserElement from "../elements/ComboboxUserElement";
import PercentageFormController from "../elements/PercentageFormController";

function formatAsPrice(value: number) {
  return (value /= 100).toLocaleString("es-MX", {
    style: "currency",
    currency: `mxn`,
  });
}

const today = new Date();
const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
const yyyy = today.getFullYear();

const todayDate = `${dd} / ${mm} / ${yyyy}`;
export default function CreateQuotationForm() {
  const utils = trpc.useContext();
  const session = useSession();

  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  const { mutateAsync: imgResponse } = trpc.image.showUrl.useMutation();

  const [productArray, setProductArray] = useState<Array<string>>();
  const [enabled, setEnabled] = useState(false);
  const { data: people } = trpc.users.all.useQuery();

  const products = trpc.product.all.useQuery();
  const filteredProduct = products.data
    ?.filter((p) => productArray?.includes(p.id))
    .map((p) => {
      return {
        id: p.id,
        price: p.price,
        image: p.image,
        name: p.name,
        quantity: 1,
      };
    });

  const [filterProducts, setFilterProducts] = useState(
    filteredProduct ? [...filteredProduct] : [],
  );

  const { mutateAsync: mutatePdf } = trpc.pdf.create.useMutation();
  const { mutateAsync: saveQuotation } = trpc.quote.save.useMutation();
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateQuoteFormValues>({
    resolver: zodResolver(createQuoteFormSchema),
  });
  const { mutate: createQuotation, isLoading: creadoQuotation } =
    trpc.quote.create.useMutation({
      async onSuccess(data) {
        const array: any[] = [
          ["Equipo", "Cant", "Clave", "Nombre", "Precio.Un", "Importe"],
        ];

        const quotation = data;

        // const fullCart = undefined;
        const formattedLogo = await fetch("/api/icb-logo.png");
        if (quotation)
          for (const product of quotation.products) {
            const cartProduct = filterProducts?.find(
              (p) => p.id.split(",")[0] === product.id,
            );
            const userDiscount = !enabled
              ? quotation?.discount
                ? quotation?.discount / 10000
                : 0
              : watch("discount")
              ? (watch("discount") ?? 0) / 10000
              : 0;

            const formattedOriginal = await imgResponse({
              original: product.image.original,
            });

            const row = [
              {
                image:
                  formattedOriginal &&
                  `data:image/jpeg;base64,${formattedOriginal?.toString()}`,
                width: 50,
                height: 50,
              },
              {
                text: cartProduct?.quantity ?? 1,
                alignment: "center",
                margin: [0, 15, 0, 0],
              },
              { text: product.SKU, alignment: "center", margin: [0, 15, 0, 0] },
              { text: product.name, alignment: "left", margin: [0, 15, 0, 0] },
              {
                text: formatAsPrice(
                  product.price - product.price * userDiscount,
                ),
                alignment: "center",
                margin: [0, 15, 0, 0],
              },
              {
                text: formatAsPrice(
                  (product.price - product.price * userDiscount) *
                    (cartProduct?.quantity || 1),
                ),
                alignment: "center",
                margin: [0, 15, 0, 0],
              },
            ];
            array.push(row);
          }

        const cartTotalPrice =
          filterProducts
            ?.map((p) => {
              const userDiscount = !enabled
                ? quotation?.discount
                  ? quotation?.discount / 10000
                  : 0
                : watch("discount")
                ? (watch("discount") ?? 0) / 10000
                : 0;
              const dataProduct = quotation?.products.find(
                (product) => p.id.split(",")[0] === product.id,
              );
              return (
                ((dataProduct?.price ?? 0) -
                  (dataProduct?.price ?? 0) * userDiscount) *
                p.quantity
              );
            })
            .reduce((acc: number, curr: number) => acc + curr, 0) || 0;

        const pdfData = {
          pageSize: "Letter",
          pageMargins: [40, 150, 40, 60],
          header: {
            layout: "noBorders",
            table: {
              widths: ["*", 275, "*"],
              body: [
                [
                  {
                    image: "snow",
                    width: 100,
                    height: 100,
                    margin: [50, 2, 10, 20],
                  },
                  {
                    text: [
                      {
                        text: "INGENIERIA CIENTIFICA BIONANOMOLECULAR\n",
                        fontSize: 12,
                        bold: true,
                      },
                      "RFC ICB161019KS4 \n",
                      "Volcán Paricutín # 5103 \n",
                      "COL. El Colli Urbano 1a. Sección. C.P. 45070 \n",
                      "Zapopan, Jalisco, México \n",
                      {
                        text: "www.icb-mx.com         Tel: (33) 36 28 83 33 \n",
                      },
                    ],
                    style: "header",
                  },
                  {
                    text: [
                      `Folio: ${quotation?.id ?? "XXXXXXX"}\n`,
                      "Fecha de Elaboración\n",
                      todayDate,
                    ],
                    alignment: "right",
                    style: "dateOf",
                  },
                ],
              ],
            },
            style: {
              margin: [25, 10, 25, 5],
            },
          },
          content: [
            {
              columns: [
                {
                  text: [
                    {
                      text: "COTIZADO A: \n",
                      fontSize: 10,
                      bold: true,
                      color: "#0F52BA",
                    },
                    "No. Cliente: \n",
                    `Nombre: ${quotation?.user?.name ?? watch("name") ?? ""}\n`,
                    `At'n a: \n`,
                    `E-mail: ${quotation?.user?.email ?? ""}; ${
                      quotation?.user?.contactMails
                        ?.map((em) => ` ${em}`)
                        .join(";") ??
                      watch("email") ??
                      ""
                    }\n`,
                    `Tel. ${
                      quotation?.user?.contactPhones
                        ?.map((ph) => ` ${ph}`)
                        ?.join(";") ??
                      watch("phone") ??
                      ""
                    }\n`,
                    "A continuación se pone a su consideración la siguiente cotización:\n",
                    `Cotización generada por: ${
                      session?.data?.user?.name ?? ""
                    } \n`,
                  ],
                  style: "userInfo",
                },
                {
                  text: [
                    {
                      text: "Datos Bancarios para depósito a nombre de: \n",
                      fontSize: 10,
                      bold: true,
                    },
                    "Banco Banamex\n",
                    "Sucursal 7010\n",
                    `Cuenta 2210466\n`,
                    "Clabe 002320701022104660\n",
                  ],
                  style: "payInfo",
                },
              ],
            },
            {
              layout: "lightHorizontalLines",
              style: { fontSize: 10 },
              table: {
                headerRows: 1,
                widths: ["*", 25, "*", 150, "*", "*"],
                body: array,
              },
            },
            {
              columns: [
                {
                  text: [],
                },
                {
                  columns: [
                    {
                      text: ["Importe \n", "Subtotal\n", "I.V.A.\n", `TOTAL\n`],
                    },
                    {
                      text: [
                        `${formatAsPrice(cartTotalPrice ?? 0)} \n`,
                        `${formatAsPrice(cartTotalPrice ?? 0)}\n`,
                        `${formatAsPrice((cartTotalPrice ?? 0) * 0.16)}\n`,
                        `${formatAsPrice(
                          (cartTotalPrice ?? 0) + (cartTotalPrice ?? 0) * 0.16,
                        )}\n`,
                      ],
                    },
                  ],
                },
              ],
              style: "summary",
            },
            {
              text: [
                "Notas: \n",
                "Condiciones de Pago: Contado al pedido.\n",
                "Precios en Pesos Mexicanos Antes de IVA, No Incluyen Instalación Ni Flete.\n",
                "Vigencia de la Cotización 30 Días Salvo Cambio de Paridad Mayor al 5%.\n",
                "Garantía de un año en todas sus partes contra defectos de fabricación.\n",
                "Términos de venta EXW en nuestras oficinas.\n",
                "Pedidos en Firme No se Aceptan Cancelaciones.\n",
                "Los Fletes cotizados no incluyen seguros, favor de solicitarlos por escrito.\n",
                "Sujeto a existencias. Consulte disponibilidad.\n",
              ],
              style: "notes",
              bold: false,
            },
            {
              text: ["Quedamos a sus órdenes,"],
              // style: 'notes',
              alignment: "right",
              bold: true,
              fontSize: 10,
            },
          ],
          images: {
            snow: formattedLogo.url,
          },
          styles: {
            header: {
              fontSize: 8,
              bold: true,
              alignment: "left",
              margin: [5, 20, 10, 20],
            },
            dateOf: {
              fontSize: 8,
              bold: true,
              margin: [5, 20, 20, 20],
            },
            userInfo: {
              fontSize: 8,
              bold: true,
              alignment: "left",
              margin: [5, 2, 10, 20],
            },
            payInfo: {
              fontSize: 8,
              bold: true,
              alignment: "justify",
              margin: [5, 2, 10, 20],
            },
            notes: {
              fontSize: 8,
              bold: true,
              alignment: "justify",
            },
            summary: {
              // fontSize: 8,
              margin: [0, 10, 0, 20],
            },
          },
          defaultStyle: {
            columnGap: 20,
          },
        };

        // @ts-expect-error TODO: fix this
        const resultPDF = pdfMake.createPdf(pdfData);

        resultPDF.download(
          `cotización_${todayDate}_${(+new Date() * Math.random())
            .toString(36)
            .substring(0, 6)}`,
        );

        resultPDF.getBase64((base) => {
          const obj = {
            path: "pdf/cotizaciones",
            pdf: `data:application/pdf;base64,${base}`,
            name: `cotización_${todayDate}_${(+new Date() * Math.random())
              .toString(36)
              .substring(0, 6)}`,
          };
          mutatePdf(obj)
            .then(async (res) => {
              const resObj = {
                user: (selectedUser as User)?.email || watch("email") || "",
                products: filterProducts,
                pdfId: res?.id,
                id: quotation?.id,
              };
              await saveQuotation(resObj);
            })
            .catch((e: Error) => e);
        });

        await utils.quote.all.invalidate();
        setProductArray([]);
        reset();
        await Toast.fire({
          title: "La cotización ha sido generada",
          icon: "success",
        });
      },
      async onError(e) {
        await Toast.fire({
          title: e.message,
          icon: "error",
        });
      },
    });

  const { data: selectedUser } = trpc.users.show.useQuery({
    email: watch("user"),
  });

  /**
   * Submits form data.
   * - Checks if image was submitted properly.
   * - Connects logoId and categories to quotation.
   *
   * @param {CreateQuoteFormValues} data
   * @returns
   */
  function submitForm(data: CreateQuoteFormValues) {
    if (enabled) {
      const { products, name, email, phone, discount, ...info } = data;
      createQuotation({
        name,
        email,
        phone,
        discount,
        products: productArray,
      });
    } else {
      const { products, user, ...info } = data;
      createQuotation({
        user,
        products: productArray,
      });
    }
  }

  /**
   * Catch form input errors.
   *
   * @param {keyof CreateQuotationFormValues} field
   * @returns
   */
  function getError(field: keyof CreateQuoteFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  /**
   * Connects producer to the products.
   *
   * @param {string} productId
   */
  function handleAdd(productId: string) {
    setProductArray([...(productArray || []), productId]);
    submitForm;
  }

  /**
   * Deletes connection of producer to the products.
   *
   * @param {string} productId
   */
  function handleRemove(productId: string) {
    const newArray = productArray?.filter((id) => id !== productId);
    setProductArray(newArray);
  }

  function handleQuantity(value: {
    quantity: number;
    id: string;
    price: number;
    image: ImageType;
    name: string;
  }) {
    const reqinfo = filterProducts?.filter((p) => p.id !== value.id);
    setFilterProducts([...reqinfo, value]);
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <Switch.Group as="div" className="mb-5 flex items-center">
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={classNames(
            enabled ? "bg-indigo-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              enabled ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </Switch>
        <Switch.Label as="span" className="ml-3 text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-50">
            Generar datos de usuario
          </span>{" "}
          {/* <span className="text-gray-500 dark:text-gray-300">(Save 10%)</span> */}
        </Switch.Label>
      </Switch.Group>
      {!enabled ? (
        <ComboboxUserElement
          // @ts-expect-error TODO: fix this
          control={control}
          label="Usuario"
          name="user"
          data={
            people as (User & {
              role: Role;
              address: Address[];
              picture: ImageType | null;
            })[]
          }
          className="col-span-5 -mb-12"
          isProduct
          // error={getError("producer")}
        />
      ) : (
        <div className="grid grid-cols-4 gap-x-4">
          <TextFormElement
            label="Nombre"
            {...register("name")}
            error={getError("name")}
            className="col-span-4 -mb-7 md:col-span-2"
          />
          <PercentageFormController
            control={control}
            name="discount"
            nombre="Descuento"
            error={getError("discount")}
            className="col-span-4 -mb-7 md:col-span-2"
          />
          <TextFormElement
            label="Email"
            {...register("email")}
            error={getError("email")}
            className="col-span-4 -mb-7 md:col-span-2"
          />
          <TextFormElement
            label="Teléfono"
            {...register("phone")}
            error={getError("phone")}
            className="col-span-4 -mb-7 md:col-span-2"
          />
        </div>
      )}
      <div className="my-10">
        <ProductsTable
          handleRemove={handleRemove}
          handleAdd={handleAdd}
          AddFunc
          idArray={productArray}
          stateTd={false}
          approveTd={false}
          // priceTd={false}
          stockTd={false}
          producerTd={false}
          buttonSubmit={false}
        />
      </div>
      {(filteredProduct?.length ?? 0) > 0 && (
        <div className="relative my-10 overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Imagen</span>
                </th>
                <th scope="col" className="px-6 py-3">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3">
                  Precio unitario
                </th>
                <th scope="col" className="px-6 py-3">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3">
                  Precio con descuento
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Acción
                </th> */}
              </tr>
            </thead>
            <tbody>
              {filteredProduct?.map((product, i) => (
                <tr
                  key={i}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="w-32 p-4">
                    <Image
                      src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product.image.path}/${product.image.original}`}
                      alt={product.image?.alt || ""}
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {formatAsPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        name={product.id}
                        id="first_product"
                        className="block w-14 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="1"
                        required
                        min={1}
                        onChange={(e) =>
                          handleQuantity({
                            ...product,
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {formatAsPrice(
                      product.price *
                        (1 -
                          ((enabled
                            ? watch("discount")
                            : (selectedUser as User & { role: Role })?.role
                                ?.discount) ?? 0) /
                            10000 || 1),
                    )}
                  </td>
                  {/* <td className="px-6 py-4">
                    <a
                      href="#"
                      className="font-medium text-red-600 hover:underline dark:text-red-500"
                    >
                      Quitar
                    </a>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <LinkElement
        href={`/admin/cotizacion`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoQuotation && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {creadoQuotation && (
        <ButtonElement type="button" disabled intent="primary">
          <Spinner
            classNameDiv="none"
            classNameSVG="w-5 h-5 mr-3 animate-spin"
          />
          Subiendo...
        </ButtonElement>
      )}
      <DevTool control={control} />
    </form>
  );
}
