import { classNames } from "~/utils/object";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function TableRow({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <tr
      {...props}
      className={classNames(
        className,
        "border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600",
      )}
    >
      {children}
    </tr>
  );
}
