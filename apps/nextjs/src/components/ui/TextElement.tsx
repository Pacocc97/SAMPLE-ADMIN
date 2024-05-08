import { cva, type VariantProps } from "class-variance-authority";

import { classNames } from "~/utils/object";

export const styles = cva("leading-[initial]", {
  variants: {
    intent: {
      primary:
        "text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400",
      black: "text-black dark:text-white",
    },
  },
  defaultVariants: {
    intent: "black",
  },
});

export interface Props
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof styles> {}

export default function TextElement({
  intent,
  children,
  className = "",
  ...props
}: Props) {
  return (
    <span className={classNames(styles({ intent }), className)} {...props}>
      {children}
    </span>
  );
}
