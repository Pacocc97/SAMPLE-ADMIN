import { useState } from "react";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { EditorState, LexicalEditor } from "lexical";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";
import styles from "./Editor.module.css";
import { HashtagNode } from "./LexicalHashtagNode";
import { useSettings } from "./context/SettingsContext";
import { ImageNode } from "./nodes/ImageNode";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import { TablePlugin } from "./plugins/LexicalTablePlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizer";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ExampleTheme from "./themes/ExampleTheme";

function Placeholder() {
  return <div className={styles["editor-placeholder"]}>Escriba aquí . . .</div>;
}
interface EditorProps {
  preValue: string | null | undefined;
  error?: string;
  placeholder?: JSX.Element | string;
  nombre?: string;
  className?: string;
}

interface FieldValues {
  [x: string]: string | undefined;
}

const Editor = ({
  error,
  preValue,
  nombre,
  className = "",
  ...props
}: EditorProps & UseControllerProps) => {
  const {
    field: { name, onChange, value },
  } = useController<FieldValues, string>(props);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const {
    settings: { tableCellMerge, tableCellBackgroundColor },
  } = useSettings();

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  /**
   * Sets editor value as editor format and html format and sends an object to the form data.
   *
   * @param editorState
   * @param editor
   */
  function handleChange(editorState: EditorState, editor: LexicalEditor) {
    editor.update((): void => {
      const html = $generateHtmlFromNodes(editor, null);

      const editorState = editor.getEditorState();
      const jsonString = JSON.stringify(editorState);

      const dataString = JSON.stringify([{ jsonString }, { html }]);

      onChange &&
        onChange(
          dataString, //jsonString, //html
        );
    });
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const lexicalStructure = JSON.stringify(editorState);
        // save to a db for later use
      });
    });
  }

  const myValue: string =
    typeof value === "string"
      ? JSON.parse(value)
      : preValue
      ? JSON.parse(preValue)
      : "";

  const jsonValue =
    myValue === ""
      ? null
      : typeof myValue === "object"
      ? myValue[0]["jsonString"]
      : null;

  const editorConfig = {
    namespace: "MyEditor",
    editorState: jsonValue, // TRY IT TO SEE SAMPLE FORMAT
    theme: ExampleTheme,
    // Handling of errors during update
    onError(error: Error) {
      throw error;
    },
    // Any custom nodes go here
    nodes: [
      HeadingNode,
      HashtagNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      ImageNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      {
        replace: LinkNode,
        with: (node: LinkNode) => {
          node.setTarget("_blank"); //maybe delete this and simply use "_blank" on target property of new node
          return new LinkNode(
            node.getURL(),
            {
              target: node.getTarget(),
              rel: node.getRel(),
              title: node.getTitle(),
            },
            undefined,
          );
        },
      },
    ],
  };

  return (
    <div className={classNames(className,  'mb-5')}>
      <div className="editor-shell">
        <LexicalComposer initialConfig={editorConfig}>
          <h1 className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
            {nombre ? nombre : name}
          </h1>
          <div className={styles["editor-container"]}>
            <ToolbarPlugin />
            <div className={styles["editor-inner"]}>
              <RichTextPlugin
                contentEditable={
                  <div className="editor-scroller">
                    <div className="editor" ref={onRef}>
                      <ContentEditable
                        className={classNames(
                          styles["editor-input"] || "",
                          "editor-input rounded-b-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400",
                        )}
                      />
                    </div>
                  </div>
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />

              <OnChangePlugin onChange={handleChange} />
              <HashtagPlugin />
              <HistoryPlugin />
              <ImagesPlugin />
              <TablePlugin
                hasCellMerge={tableCellMerge}
                hasCellBackgroundColor={tableCellBackgroundColor}
              />
              <TableCellResizerPlugin />
              <AutoFocusPlugin />
              <CodeHighlightPlugin />
              <ListPlugin />
              <LinkPlugin />
              <AutoLinkPlugin />
              <ListMaxIndentLevelPlugin maxDepth={7} />

              {floatingAnchorElem && (
                <>
                  <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                  <TableCellActionMenuPlugin
                    anchorElem={floatingAnchorElem}
                    // cellMerge={true}
                  />
                </>
              )}
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>

  );
};
Editor.displayName = "Editor";
export default Editor;
