import { type ReactNode } from "react";

type DefaultLayoutProps = { children: ReactNode };

export const LoginLayout = ({ children }: DefaultLayoutProps) => {
  return <main>{children}</main>;
};
