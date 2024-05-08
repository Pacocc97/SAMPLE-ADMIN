import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import type {
  Address,
  Category,
  Image,
  User as PrismaUser,
  Producer,
  ProducerOfProduct,
  Product,
  Role,
} from "@prisma/client";
import { useController } from "react-hook-form";

import { classNames } from "~/utils/object";

type ProducerExtended = Producer & {
  logo: Image | undefined | null;
  product: (ProducerOfProduct & {
    product: Product & {
      image: Image;
      Category: (Category & {
        parent: Category | null;
        child: Category[];
      })[];
    };
  })[];
};

type Value = {
  id: string;
};
// Update the User type to include the role property
interface User extends PrismaUser {
  role: Role;
}

type DataUnion = User[] | User;

interface MyProps {
  name: string;
  label: string;
  className: string;
  dangerous?: boolean;
  data?: (User & {
    role: Role | null;
    address: Address[];
    picture: Image | null;
  })[];
  error?: string;
  defaultValue: ProducerExtended[];
  isProduct?: boolean;
}

export default function ComboboxUserElement({
  error,
  label,
  defaultValue,
  className,
  isProduct = false,
  dangerous = false,
  ...props
}: MyProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const {
    field: { name, onChange, value },
  } = useController(props);
  const { data } = props;
  const typedValue: Value = value;

  const [selected, setSelected] = useState<User>();
  const [query, setQuery] = useState("");

  const filteredData =
    query === ""
      ? data
      : data?.filter((user) => {
          return (
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase())
          );
        });

  useEffect(() => {
    if (typedValue && typedValue.id) {
      const newValor = typedValue.id;
      setSelected(data?.find(({ id }) => newValor.includes(id)));
    } else {
      return;
    }
  }, [data, typedValue]);
  /**
   * Adds user to product
   * fires modal if already have 1 product assigned
   *
   */
  function handleChange(e: User) {
    setSelected(e);
    onChange(e.email);
  }

  // Now, apply the union type to the displayValue function
  const displayValue = (data: DataUnion) => {
    if (Array.isArray(data)) {
      return data
        ?.map((user) => `${user.name || ""} / ${user.email || ""}`)
        .join(", ");
    } else {
      return `${data?.name || ""} / ${data?.email || ""}`;
    }
  };

  return (
    <>
      <Combobox
        as="div"
        value={selected}
        className={classNames(className, "mb-5")}
        onChange={(e) => handleChange(e)}
        // multiple
      >
        <Combobox.Label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {label ? label : name.replace("Id", "")}
        </Combobox.Label>
        <div className={classNames(error ? "" : "mb-12", "relative")}>
          <Combobox.Button as="div">
            <Combobox.Input
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={displayValue}
              placeholder="Buscar o seleccionar"
              className={classNames(
                error
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600",
                "relative w-full cursor-default rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-left text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700  dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ",
              )}
              {...props}
            />
            <div className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </Combobox.Button>

          {(filteredData?.length ?? 0) > 0 && (
            <Combobox.Options className="disabled:bg-gray-200' absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-50 py-1 text-base text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800 sm:text-sm">
              {filteredData?.map((user, i) => (
                <Combobox.Option
                  key={i}
                  value={user}
                  className={({ active }) =>
                    classNames(
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-gray-900 dark:text-white",
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "ml-3 block truncate",
                          )}
                        >
                          {user?.name}
                        </span>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "ml-3 block truncate",
                          )}
                        >
                          {user?.email}
                        </span>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "ml-3 block truncate",
                          )}
                        >
                          {user?.role?.name}
                        </span>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "ml-3 block truncate",
                          )}
                        >
                          {(user?.role?.discount ?? 0) / 100}%
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={classNames(
                            active
                              ? "text-white"
                              : "text-indigo-600 dark:text-indigo-300",
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>

      {/* <button onClick={handleReset}>Cotización sin usuario</button> */}
    </>
  );
}
