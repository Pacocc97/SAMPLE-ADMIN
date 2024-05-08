import { classNames } from "~/utils/object";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function TableData({ children, className = "" }: Props) {
  return <td className={classNames(className, "px-6 py-4")}>{children}</td>;
}
