import { cva, type VariantProps } from "class-variance-authority";

import { classNames } from "~/utils/object";

export const styles = cva(
  "inline-flex items-center justify-center font-medium capitalize border border-transparent rounded-md shadow-sm focus:outline-none",
  {
    variants: {
      intent: {
        primary:
          "bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-600 hover:to-emerald-700 text-white",
        blue: "text-white bg-indigo-600 hover:bg-indigo-700",
        danger: "text-white bg-red-600 hover:bg-red-700",
      },
      fullWidth: {
        true: "w-full",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      fullWidth: false,
      size: "md",
    },
  },
);

export interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof styles> {}

export default function ButtonElement({
  intent,
  fullWidth,
  size,
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={classNames(styles({ intent, fullWidth, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
