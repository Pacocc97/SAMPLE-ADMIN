/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import styles from "./ContentEditable.module.css";

export default function LexicalContentEditable({
  className,
}: {
  className?: string;
}): JSX.Element {
  return (
    <ContentEditable className={className || styles["ContentEditable__root"]} />
  );
}
