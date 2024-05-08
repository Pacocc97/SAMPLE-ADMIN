import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { classNames } from "~/utils/object";
import { styles } from "./ButtonElement";

export interface DefaultProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof styles> {}

export interface Props extends DefaultProps {
  href?: string | any;
}

export default function LinkElement({
  intent,
  fullWidth,
  size,
  href,
  children,
  className = "",
  ...props
}: Props) {
  if (href) {
    return (
      <Link
        href={href}
        className={classNames(styles({ intent, fullWidth, size }), className)}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <span
      className={classNames(styles({ intent, fullWidth, size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
