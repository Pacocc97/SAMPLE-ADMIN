import type { CSSProperties } from "react";

import { classNames } from "~/utils/object";

type Props = {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function TableHeadRow({
  children,
  className = "",
  style,
}: Props) {
  return (
    <th
      scope="row"
      style={style}
      className={classNames(className, "px-6 py-3")}
    >
      {children}
    </th>
  );
}
