import {
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import type { ProductHistory, Role, User } from "@prisma/client";

import { classNames } from "~/utils/object";

type Action = {
  accion?: string;
  historial: ProductHistory & {
    user:
      | (User & {
          role: Role | null;
        })
      | null;
  };
};

export default function SeccionHistorial({ accion, historial }: Action) {
  const formattedDate = historial?.date?.toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  return (
    <li>
      <div className="relative rounded-lg bg-white py-2 dark:bg-transparent">
        <div className="relative flex space-x-3">
          <div>
            <span
              className={classNames(
                accion === "create"
                  ? "bg-blue-500"
                  : accion === "edit"
                  ? " bg-gray-400"
                  : accion === "approve"
                  ? " bg-green-500"
                  : " bg-amber-500",
                "mt-2 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-transparent",
              )}
            >
              {accion === "create" ? (
                <ArrowUpTrayIcon
                  fill="white"
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : accion === "edit" ? (
                <ArrowPathIcon
                  fill="white"
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : accion === "approve" ? (
                <CheckIcon
                  fill="white"
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <ExclamationTriangleIcon
                  fill="white"
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {historial?.user?.name} ({historial?.user?.role?.name}){" "}
                <a
                  href="#"
                  className="font-medium text-gray-900 dark:text-white"
                >
                  {accion === "create"
                    ? "creó el"
                    : accion === "edit"
                    ? "editó el"
                    : accion === "approve"
                    ? "aprobó el"
                    : "desaprobó el"}
                  :
                </a>{" "}
              </p>
            </div>
            <div className="whitespace-nowrap pr-3 text-right text-sm text-gray-500 dark:text-gray-300">
              <time dateTime={formattedDate}>{formattedDate}</time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
