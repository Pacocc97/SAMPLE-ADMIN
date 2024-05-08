import type { Product, ProductHistory, Role, User } from "@prisma/client";

import SeccionHistorial from "./SeccionHistorial";

type MiHistorial = ProductHistory & {
  user: User & {
    role: Role | null;
  };
};

export default function Historial({ product }: { product: Product }) {
  const Historial = (
    product as Product & { ProductHistory: MiHistorial[] }
  )?.ProductHistory.sort((a, b) => a.id - b.id);

  return (
    <section
      aria-labelledby="timeline-title"
      className="lg:col-span-1 lg:col-start-3"
    >
      <div className="px-4 py-5">
        <h2
          id="timeline-title"
          className="text-lg font-medium text-gray-900 dark:text-white"
        >
          Historial
        </h2>

        <div className="mt-6 flow-root">
          <ul role="list" className="-mb-8 divide-y">
            {Historial?.reverse().map(
              (historial: MiHistorial, index: number) => (
                <SeccionHistorial
                  key={index}
                  accion={historial.type}
                  historial={historial}
                />
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
