import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { classNames } from "~/utils/object";
import EmptyState from "~/components/EmptyState";
import Unauthorized from "./Unauthorized";
import ButtonElement from "./ui/ButtonElement";

type Props = {
  children?: React.ReactNode;
  name: string;
  hasData?: boolean;
  icon: JSX.Element;
  page?: "list" | "create" | "show" | "update";
  displayHeader?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  manualResponsive?: boolean;
  translate?: string;
  translatePage?: string;
};

export default function PageComponent({
  children,
  name,
  hasData = true,
  icon,
  page = "list",
  displayHeader = true,
  setOpen,
  manualResponsive = true,
  translate,
  translatePage,
}: Props) {
  const { data: session } = useSession({
    required: true,
  });
  const canCreate = hasPermission(session, `create_${name}`);

  if (!session?.user?.permissions?.includes(`${page}_${name}`)) {
    return <Unauthorized permission={`${page}_${name}`} />;
  }

  return (
    <div>
      {displayHeader && (
        <div className="mb-8 flex items-center justify-between">
          <span
            className={classNames(
              manualResponsive
                ? "sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                : "",
              "inline-flex items-center text-2xl font-extrabold",
            )}
          >
            <div className="mr-6 mt-2 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
              {icon}
            </div>
            {page !== "list" && (
              <span className="mr-4 capitalize">
                {translatePage ? translatePage : page}
              </span>
            )}
            <h1 className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text capitalize leading-[initial] text-transparent">
              {translate ? translate : name}
            </h1>
          </span>
          {setOpen && children && hasData ? (
            <ButtonElement
              className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-sky-500 to-emerald-600 px-4 py-2 text-base font-medium capitalize text-white shadow-sm hover:from-sky-600 hover:to-emerald-700 focus:outline-none"
              onClick={() => setOpen(true)}
            >
              <PlusCircleIcon
                className="-ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              Crear {translate ? translate : name}
            </ButtonElement>
          ) : (
            page === "list" &&
            canCreate.status && (
              <Link
                href={`/admin/${translate ? translate : name}/crear`}
                className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-sky-500 to-emerald-600 px-4 py-2 text-base font-medium capitalize text-white shadow-sm hover:from-sky-600 hover:to-emerald-700 focus:outline-none"
              >
                <PlusCircleIcon
                  className="-ml-1 mr-3 h-5 w-5"
                  aria-hidden="true"
                />
                Crear {translate ? translate : name}
              </Link>
            )
          )}
        </div>
      )}
      <div>
        {children && hasData ? (
          children
        ) : (
          <EmptyState link={`/admin/${translate ? translate : name}/crear`}>
            Crear {translate ? translate : name} para comenzar.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
