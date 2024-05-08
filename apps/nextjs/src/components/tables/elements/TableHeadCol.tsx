import { classNames } from "~/utils/object";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export default function TableHeadCol({ children, className = "" }: Props) {
  return (
    <th scope="col" className={classNames(className, "px-6 py-3")}>
      {children}
    </th>
  );
}
