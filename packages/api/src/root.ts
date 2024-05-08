import { addressRouter } from "./router/address";
import { authRouter } from "./router/auth";
import { blogRouter } from "./router/blog";
import { categoryRouter } from "./router/category";
import { categoryBlogRouter } from "./router/categoryBlog";
import { typeRouter, unitRouter } from "./router/extras";
import { gifRouter } from "./router/gif";
import { imageRouter } from "./router/image";
import { openPayRouter } from "./router/openPay";
import { orderRouter } from "./router/order";
import { packageRouter } from "./router/package";
import { pdfRouter } from "./router/pdf";
import { permissionsRouter } from "./router/permissions";
import { producerRouter } from "./router/producer";
import { productRouter } from "./router/product";
import { quoteRouter } from "./router/quote";
import { rolesRouter } from "./router/roles";
import { searchsRouter } from "./router/search";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  image: imageRouter,
  product: productRouter,
  package: packageRouter,
  producer: producerRouter,
  category: categoryRouter,
  gif: gifRouter,
  search: searchsRouter,
  pdf: pdfRouter,
  type: typeRouter,
  unit: unitRouter,
  users: usersRouter,
  roles: rolesRouter,
  permissions: permissionsRouter,
  blog: blogRouter,
  blogCategory: categoryBlogRouter,
  quote: quoteRouter,
  order: orderRouter,
  openpay: openPayRouter,
  address: addressRouter,
  auth: authRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
