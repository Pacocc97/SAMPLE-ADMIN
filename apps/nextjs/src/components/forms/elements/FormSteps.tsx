import type { Dispatch, SetStateAction } from "react";

export default function FormSteps({
  steps,
  setPasoCompra,
}: {
  steps: {
    id?: string;
    name?: string;
    paso: string;
    status: string;
    error?: boolean;
  }[];
  setPasoCompra:
    | Dispatch<SetStateAction<string | string[]>>
    | Dispatch<SetStateAction<string>>;
}) {
  return (
    <nav className="mb-10 max-w-md" aria-label="Progress">
      <ol
        role="list"
        className="flex space-y-4 md:flex md:space-x-8 md:space-y-0"
      >
        {steps.map(
          (step: {
            id?: string;
            name?: string;
            paso: string;
            status: string;
            error?: boolean;
          }) => (
            <li key={step.id} className="md:flex-1">
              {step.status === "complete" ? (
                <button
                  onClick={() => setPasoCompra(step.paso)}
                  className={
                    step.error === true
                      ? "group flex flex-col border-l-4 border-red-400 py-2 pl-4 hover:border-red-600 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                      : "group flex flex-col border-l-4 border-indigo-400 py-2 pl-4 hover:border-indigo-600 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  }
                >
                  <span
                    className={
                      step.error === true
                        ? "text-sm font-medium text-red-400 group-hover:text-red-400"
                        : "text-sm font-medium text-indigo-400 group-hover:text-indigo-400"
                    }
                  >
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
              ) : step.status === "current" ? (
                <button
                  onClick={() => setPasoCompra(step.paso)}
                  className={
                    step.error === true
                      ? "flex flex-col border-l-4 border-red-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                      : "flex flex-col border-l-4 border-indigo-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  }
                  aria-current="step"
                >
                  <span
                    className={
                      step.error === true
                        ? "text-sm font-medium text-red-600"
                        : "text-sm font-medium text-indigo-600"
                    }
                  >
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => setPasoCompra(step.paso)}
                  className={
                    step.error === true
                      ? "group flex flex-col border-l-4 border-red-300 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                      : "group flex flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  }
                >
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
              )}
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
