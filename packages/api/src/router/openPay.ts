import Openpay from "openpay";

import { findById } from "../schemas/generalSchema";
import { createOpenPaySchema } from "../schemas/openPaySchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";

const openpay = new Openpay(
  process.env.PUBLIC_OPENPAY_MERCHANT_ID as string,
  process.env.PUBLIC_OPENPAY_SECRET_API_KEY as string,
);

export interface OpenPayType {
  id: string;
  authorization: string;
  operation_type: string;
  transaction_type: string;
  status: string;
  conciliated: boolean;
  creation_date: string;
  operation_date: string;
  description: string | null;
  error_message: string | null;
  order_id: string | null;
  card: {
    type: string;
    brand: string;
    address: string | null;
    card_number: string;
    holder_name: string;
    expiration_year: string;
    expiration_month: string;
    allows_charges: boolean;
    allows_payouts: boolean;
    bank_name: string;
    bank_code: string;
  };
  customer_id: string;
  amount: number;
  currency: string;
  fee: {
    amount: number;
    tax: number;
    currency: string;
  };
  method: string;
}

export const openPayRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.openPayData.findMany({});
  }),

  // create
  create: publicProcedure
    .input(createOpenPaySchema)
    .mutation(async ({ input, ctx }) => {
      const user = input.userId
        ? await ctx.prisma.user.findUnique({
          where: { id: input.userId },
          include: {
            role: true,
          },
        })
        : null;

      const discount = 1 - (user?.role?.discount || 0) / 10000;
      const { userId, productArray, email, client_name, ...data } = input;
      let priceArr: number[] = [];
      for (const product of productArray) {
        const finalPrice = await ctx.prisma.product.findUnique({
          where: { id: product.id },
        });
        const fixedPrice = ((finalPrice?.price || 0) * discount * 1.16) / 100;
        priceArr.push(fixedPrice * product.quantity);
      }

      const existingEmail = email
        ? await ctx.prisma.user.findUnique({
          where: {
            email: email,
          },
        })
        : null;

      if (
        (existingEmail || user) &&
        (user?.openPayId || existingEmail?.openPayId)
      ) {
        const customerInfo = user?.openPayId || existingEmail?.openPayId;
        return new Promise((resolve, reject) => {
          openpay.customers.charges.create(
            customerInfo as string,
            {
              ...data,
              method: "card",
              amount: priceArr.reduce((acc, curr) => acc + curr, 0).toFixed(2),
            },
            //@ts-ignore
            (_error: any, _body: any, response: any) => {
              try {
                resolve(
                  ctx.prisma.openPayData.create({
                    data: {
                      paymentId: response.body.id as string,
                      discount: user?.role?.discount || null,
                      user: userId
                        ? {
                          connect: {
                            id: userId,
                          },
                        }
                        : undefined,
                    },
                  }),
                );
              } catch (error) {
                handleTRPCError(error);
              }
            },
          );
        });
      } else if (
        (existingEmail || user) &&
        (!user?.openPayId || !existingEmail?.openPayId)
      ) {
        console.log("tamos acaaaaaa");

        var newCustomer = {
          name: user?.name || existingEmail?.name || undefined,
          email: user?.email || existingEmail?.email || undefined,
        };
        return new Promise((resolve, reject) => {
          openpay.customers.create(
            newCustomer,
            //@ts-ignore
            async function (_error, _body, response) {
              await ctx.prisma.user.update({
                where: { id: input.userId || existingEmail?.id || undefined },
                data: {
                  openPayId: response.body.id,
                },
              });
              openpay.customers.charges.create(
                response.body.id,
                {
                  ...data,
                  method: "card",
                  amount: priceArr
                    .reduce((acc, curr) => acc + curr, 0)
                    .toFixed(2),
                },
                //@ts-ignore
                (_error: any, _body: any, res: any) => {
                  try {
                    resolve(
                      ctx.prisma.openPayData.create({
                        data: {
                          paymentId: res.body.id as string,
                          discount: user?.role?.discount || null,
                          user: {
                            connect: {
                              id: userId || existingEmail?.id,
                            },
                          },
                        },
                      }),
                    );
                  } catch (error) {
                    handleTRPCError(error);
                  }
                },
              );
            },
          );
        });
      } else {
        const newUser = await ctx.prisma.user.create({
          data: {
            name: client_name,
            email: email,
            contactMails: [],
            contactPhones: [],
            role: undefined,
            picture: undefined,
          },
        });

        const newCustomer = {
          name: newUser?.name,
          email: newUser.email,
        };
        return new Promise((resolve, reject) => {
          openpay.customers.create(
            newCustomer,
            //@ts-ignore
            async function (_error, _body, response) {
              await ctx.prisma.user.update({
                where: { id: newUser.id },
                data: {
                  openPayId: response.body.id,
                },
              });
              openpay.customers.charges.create(
                response.body.id,
                {
                  ...data,
                  method: "card",
                  amount: priceArr
                    .reduce((acc, curr) => acc + curr, 0)
                    .toFixed(2),
                },
                //@ts-ignore
                (_error: any, _body: any, res: any) => {
                  try {
                    resolve(
                      ctx.prisma.openPayData.create({
                        data: {
                          paymentId: res.body.id as string,
                          discount: null,
                          user: {
                            connect: {
                              id: newUser.id,
                            },
                          },
                        },
                      }),
                    );
                  } catch (error) {
                    handleTRPCError(error);
                  }
                },
              );
            },
          );
        });
      }
    }),

  // show
  show: publicProcedure.input(findById).query(async ({ input, ctx }) => {
    const { id } = input;
    try {
      return ctx.prisma.openPayData
        .findUnique({
          where: { id },
          include: {
            user: true,
            order: true,
          },
        })
        .then(
          async (val) =>
            val &&
            new Promise((resolve, reject) => {
              openpay.charges.get(
                val.paymentId,
                //@ts-ignore
                function (error, body, response) {
                  resolve(response.body);
                },
              );
            })
              .then((value) => {
                return { ...val, openPay: value };
              })
              .catch((err) => err),
        )
        .catch((err) => err);
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // update
  // update: protectedProcedure
  //   .input(updateOpenPaySchema)
  //   .mutation(async ({ input, ctx }) => {
  //     try {
  //       const { id, ...data } = input;
  //       return ctx.prisma.openPay.update({
  //         where: { id },
  //         data,
  //       });
  //     } catch (error) {
  //       handleTRPCError(error);
  //     }
  //   }),

  // delete
  delete: protectedProcedure
    .input(findById)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      try {
        return ctx.prisma.openPayData.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
