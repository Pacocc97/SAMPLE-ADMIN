/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Ref, RefObject } from "react";
import * as React from "react";
import { type ChangeEvent, forwardRef } from "react";

import styles from "./EquationEditor.module.css";

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

function EquationEditor(
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };

  return inline && forwardedRef instanceof HTMLInputElement ? (
    <span className={styles["EquationEditor_inputBackground"]}>
      <span className={styles["EquationEditor_dollarSign"]}>$</span>
      <input
        className={styles["EquationEditor_inlineEditor"]}
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
      <span className={styles["EquationEditor_dollarSign"]}>$</span>
    </span>
  ) : (
    <div className={styles["EquationEditor_inputBackground"]}>
      <span className={styles["EquationEditor_dollarSign"]}>{"$$\n"}</span>
      <textarea
        className={styles["EquationEditor_blockEditor"]}
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLTextAreaElement>}
      />
      <span className={styles["EquationEditor_dollarSign"]}>{"\n$$"}</span>
    </div>
  );
}

export default forwardRef(EquationEditor);
