/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react";
import { type ReactNode } from "react";

import styles from "./Dialog.module.css";

type Props = Readonly<{
  "data-test-id"?: string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className={styles["DialogButtonsList"]}>{children}</div>;
}

export function DialogActions({
  "data-test-id": dataTestId,
  children,
}: Props): JSX.Element {
  return (
    <div className={styles["DialogActions"]} data-test-id={dataTestId}>
      {children}
    </div>
  );
}
