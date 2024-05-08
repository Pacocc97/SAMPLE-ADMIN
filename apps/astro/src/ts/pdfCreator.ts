import type { Image } from "@acme/db";
import { apiPublic } from "~/utils/api";
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';

import 'pdfmake/build/vfs_fonts';
const pdfFonts = window["pdfFonts" as any];

import "pdfmake/build/pdfmake"
const pdfMake = window["pdfMake"];
pdfMake.vfs = pdfFonts.pdfMake.vfs;

type CartProduct = {
  SKU: string;
  id: string;
  image: Image;
  name: string;
  parts: CartProduct[];
  price: number;
  quantity: number;
  slug: string;
};

const buttonElement = document.getElementById("pdfButton");
buttonElement?.addEventListener("click", displayDate);

async function displayDate(e: MouseEvent) {
  e.preventDefault();
  const products =
    localStorage.getItem("carrito") &&
    JSON.parse(localStorage.getItem("carrito") as string);
  const partsArray = products
    .map((p: CartProduct) => p.parts)
    .filter((n: CartProduct) => n)
    .flat();

  const fullCart = products.concat(partsArray);
  const response = await fetch("/api/sessionData.json");
  const data = await response.json();
  const reqObj = {
    user: data?.email || "",
    products: fullCart.map((p) => p.id.split(",")[0]),
  };

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

  const todayDate = dd + "/" + mm + "/" + yyyy;

  const imgResponse = await fetch("/api/icb-logo.png");

  const array: any[] = [
    ["Equipo", "Cant", "Clave", "Nombre", "Precio.Un", "Importe"],
  ];

  const quotation = await apiPublic.quote.create.mutate(reqObj);

  if (quotation)
    for (const product of quotation.products) {
      const cartProduct = fullCart.find(
        (p: any) => p.id.split(",")[0] === product.id,
      );
      const userDiscount = quotation?.discount
        ? quotation?.discount / 10000
        : 0;

      const formattedOriginal = product.image.original;
      const response2 = await fetch(
        `/api/${product.image.path.replace(/\//g, " ")}/${formattedOriginal}`,
      );
      const data2 = await response2.json();

      const row = [
        {
          image: `data:image/jpeg;base64,${data2.body}`,
          width: 50,
          height: 50,
        },
        {
          text: cartProduct.quantity,
          alignment: "center",
          margin: [0, 15, 0, 0],
        },
        { text: product.SKU, alignment: "center", margin: [0, 15, 0, 0] },
        { text: product.name, alignment: "left", margin: [0, 15, 0, 0] },
        {
          text: formatAsPrice(product.price - product.price * userDiscount),
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

  const cartTotalPrice = fullCart
    .map((p: CartProduct) => {
      const userDiscount = quotation ? quotation.discount ? quotation.discount / 10000 : 0 : undefined;
      const dataProduct = quotation?.products.find(
        (product) => p.id.split(",")[0] === product.id,
      );
      if (dataProduct && userDiscount) {
        return (
          (dataProduct?.price - dataProduct?.price * userDiscount) * p.quantity
        );
      }
    })
    .reduce((acc: number, curr: number) => acc + curr, 0);

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
                { text: "www.icb-mx.com         Tel: (33) 36 28 83 33 \n" },
              ],
              style: "header",
            },
            {
              text: [
                `Folio: ${quotation?.id}\n`,
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
              `Nombre: ${quotation?.user?.name}\n`,
              `At'n a: \n`,
              `E-mail: ${quotation?.user?.email
              }; ${quotation?.user?.contactMails
                .map((em: string[]) => ` ${em}`)
                .join(";")}\n`,
              `Tel. ${quotation?.user?.contactPhones
                .map((ph: string[]) => ` ${ph}`)
                .join(";")}\n`,
              "A continuación se pone a su consideración la siguiente cotización:\n",
              "Cotización generada en sitio web \n",
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
        // alignment: 'justify',
        columns: [
          {
            text: [],
          },
          {
            columns: [
              { text: ["Importe \n", "Subtotal\n", "I.V.A.\n", `TOTAL\n`] },
              {
                text: [
                  `${formatAsPrice(cartTotalPrice)} \n`,
                  `${formatAsPrice(cartTotalPrice)}\n`,
                  `${formatAsPrice(cartTotalPrice * 0.16)}\n`,
                  `${formatAsPrice(cartTotalPrice + cartTotalPrice * 0.16)}\n`,
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
      snow: imgResponse.url,
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

  //  pdfMake.createPdf(pdfData).open();
  const resultPDF = pdfMake.createPdf(pdfData);

  resultPDF.download(
    `cotización_${todayDate}_${(+new Date() * Math.random())
      .toString(36)
      .substring(0, 6)}`,
  );
  resultPDF.getBase64(async (base) => {
    const obj = {
      path: "pdf/cotizaciones",
      pdf: `data:application/pdf;base64,${base}`,
      name: `cotización_${todayDate}_${(+new Date() * Math.random())
        .toString(36)
        .substring(0, 6)}`,
    };
    const res = await apiPublic.pdf.create.mutate(obj);
    const resObj = {
      user: data?.email || "",
      products: fullCart,
      pdfId: res?.id,
      id: quotation?.id,
    };
    await apiPublic.quote.save.mutate(resObj);
  });
}
// if(htmlElement) {
// }
