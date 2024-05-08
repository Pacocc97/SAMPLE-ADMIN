import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import type { Image, Producer, Product } from "@prisma/client";
import { useController } from "react-hook-form";

import { ConfirmModal } from "~/utils/alerts";
import { classNames } from "~/utils/object";

type ProducerExtended = Producer & {
  logo: Image | undefined | null;
  product: Product[];
};

interface MyProps {
  name: string;
  nombre: string;
  className: string;
  dangerous?: boolean;
  data: ProducerExtended[];
  error?: string;
  defaultValue: ProducerExtended[];
}

export default function ComboboxElement({
  error,
  nombre,
  defaultValue,
  className,
  dangerous = false,
  ...props
}: MyProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const {
    field: { name, onChange, value },
  } = useController(props);
  const { data } = props;

  const [selected, setSelected] = useState<ProducerExtended[]>([]);
  const [query, setQuery] = useState("");

  const filteredData =
    query === ""
      ? data
      : data.filter((producer) => {
          return producer?.name.toLowerCase().includes(query.toLowerCase());
        });

  useEffect(() => {
    if (value) {
      const newValor = (value as Producer[]).map(
        (producer: Producer) => producer?.id,
      );
      setSelected(data.filter(({ id }) => newValor.includes(id)));
    } else {
      return;
    }
  }, [data, value]);

  /**
   * Adds producer to product
   * fires modal if already have 1 product assigned
   *
   * @param {Array<ProducerExtended>} e
   */
  async function handleChange(e: ProducerExtended[]) {
    if (selected.length < 1) {
      setSelected(e);
      onChange(e);
    } else {
      await ConfirmModal.fire({
        title: "Desea asignar más fabricantes?",
        text: "Este producto ya cuenta con un fabrficante asignado",
        confirmButtonText: "Sí, agregrar!",
      }).then((result) => {
        if (result.isConfirmed) {
          setSelected(e);
          onChange(e);
        } else {
          return;
        }
      });
    }
  }

  return (
    <Combobox
      as="div"
      value={selected}
      className={classNames(className, "mb-5")}
      onChange={(e) => handleChange(e)}
      multiple
    >
      <Combobox.Label
        htmlFor={name}
        className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
      >
        {nombre ? nombre : name.replace("Id", "")}
      </Combobox.Label>
      <div className={classNames(error ? "" : "mb-12", "relative")}>
        <Combobox.Input
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(data: ProducerExtended[]) =>
            data.map((producer) => producer.name).join(", ")
          }
          className={classNames(
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
            "relative w-full cursor-default rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-left text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700  dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ",
          )}
          {...props}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredData?.length > 0 && (
          <Combobox.Options className="disabled:bg-gray-200' absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-50 py-1 text-base text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800 sm:text-sm">
            {filteredData.map((producer, i) => (
              <Combobox.Option
                key={i}
                value={producer}
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
                        {producer?.name}
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
  );
}
