/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableCellNode,
  $createTableNodeWithDimensions,
  $isTableNode,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
  applyTableHandlers,
  type HTMLTableElementWithWithTableSelectionState,
  type InsertTableCommandPayload,
  type TableSelection,
} from "@lexical/table";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
  $getNodeByKey,
  $isTextNode,
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR,
  DEPRECATED_$computeGridMap,
  DEPRECATED_$getNodeTriplet,
  DEPRECATED_$isGridRowNode,
  type DEPRECATED_GridCellNode,
  type ElementNode,
  type LexicalNode,
  type NodeKey,
} from "lexical";

// import invariant from 'shared/invariant';

// TODO extract to utils
function $insertFirst(parent: ElementNode, node: LexicalNode): void {
  const firstChild = parent.getFirstChild();
  if (firstChild !== null) {
    firstChild.insertBefore(node);
  } else {
    parent.append(node);
  }
}

export function TablePlugin({
  hasCellMerge = true,
  hasCellBackgroundColor = true,
}: {
  hasCellMerge?: boolean;
  hasCellBackgroundColor?: boolean;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableCellNode, TableRowNode])) {
      // invariant(
      //   false,
      //   'TablePlugin: TableNode, TableCellNode or TableRowNode not registered on editor',
      // );
    }

    return editor.registerCommand<InsertTableCommandPayload>(
      INSERT_TABLE_COMMAND,
      ({ columns, rows, includeHeaders }) => {
        const tableNode = $createTableNodeWithDimensions(
          Number(rows),
          Number(columns),
          includeHeaders,
        );
        $insertNodeToNearestRoot(tableNode);

        const firstDescendant = tableNode.getFirstDescendant();
        if ($isTextNode(firstDescendant)) {
          firstDescendant.select();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  useEffect(() => {
    const tableSelections = new Map<NodeKey, TableSelection>();

    const initializeTableNode = (tableNode: TableNode) => {
      const nodeKey = tableNode.getKey();
      const tableElement = editor.getElementByKey(
        nodeKey,
      ) as HTMLTableElementWithWithTableSelectionState;
      if (tableElement && !tableSelections.has(nodeKey)) {
        const tableSelection = applyTableHandlers(
          tableNode,
          tableElement,
          editor,
        );
        tableSelections.set(nodeKey, tableSelection);
      }
    };

    // Plugins might be loaded _after_ initial content is set, hence existing table nodes
    // won't be initialized from mutation[create] listener. Instead doing it here,
    editor.getEditorState().read(() => {
      const tableNodes = $nodesOfType(TableNode);
      for (const tableNode of tableNodes) {
        if ($isTableNode(tableNode)) {
          initializeTableNode(tableNode);
        }
      }
    });

    const unregisterMutationListener = editor.registerMutationListener(
      TableNode,
      (nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === "created") {
            editor.getEditorState().read(() => {
              const tableNode = $getNodeByKey<TableNode>(nodeKey);
              if ($isTableNode(tableNode)) {
                initializeTableNode(tableNode);
              }
            });
          } else if (mutation === "destroyed") {
            const tableSelection = tableSelections.get(nodeKey);

            if (tableSelection !== undefined) {
              tableSelection.removeListeners();
              tableSelections.delete(nodeKey);
            }
          }
        }
      },
    );

    return () => {
      unregisterMutationListener();
      // Hook might be called multiple times so cleaning up tables listeners as well,
      // as it'll be reinitialized during recurring call
      for (const [, tableSelection] of tableSelections) {
        tableSelection.removeListeners();
      }
    };
  }, [editor]);

  // Unmerge cells when the feature isn't enabled
  useEffect(() => {
    if (hasCellMerge) {
      return;
    }
    return editor.registerNodeTransform(TableCellNode, (node) => {
      if (node.getColSpan() > 1 || node.getRowSpan() > 1) {
        // When we have rowSpan we have to map the entire Table to understand where the new Cells
        // fit best; let's analyze all Cells at once to save us from further transform iterations
        const [, , gridNode] = DEPRECATED_$getNodeTriplet(node);
        const [gridMap] = DEPRECATED_$computeGridMap(gridNode, node, node);
        // TODO this function expects Tables to be normalized. Look into this once it exists
        const rowsCount = gridMap.length;
        const columnsCount = gridMap[0]?.length;
        let row = gridNode.getFirstChild();
        // invariant(
        //   DEPRECATED_$isGridRowNode(row),
        //   'Expected TableNode first child to be a RowNode',
        // );
        const unmerged = [];
        for (let i = 0; i < rowsCount; i++) {
          if (i !== 0) {
            row = (row as any).getNextSibling();
            // invariant(
            //   DEPRECATED_$isGridRowNode(row),
            //   'Expected TableNode first child to be a RowNode',
            // );
          }
          let lastRowCell: null | DEPRECATED_GridCellNode = null;
          for (let j = 0; j < (columnsCount as any); j++) {
            const cellMap = gridMap[i]?.[j];
            const cell = cellMap?.cell;
            if (cellMap?.startRow === i && cellMap.startColumn === j) {
              (lastRowCell as any) = cell;
              unmerged.push(cell);
            } else if ((cell?.getColSpan() as any) > 1 || (cell?.getRowSpan() as any) > 1) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              const newCell = $createTableCellNode(cell?.__headerState);
              if (lastRowCell !== null) {
                (lastRowCell as any).insertAfter(newCell);
              } else {
                // $insertFirst(row, newCell);
              }
            }
          }
        }
        for (const cell of unmerged) {
          cell?.setColSpan(1);
          cell?.setRowSpan(1);
        }
      }
    });
  }, [editor, hasCellMerge]);

  // Remove cell background color when feature is disabled
  useEffect(() => {
    if (hasCellBackgroundColor) {
      return;
    }
    return editor.registerNodeTransform(TableCellNode, (node) => {
      if (node.getBackgroundColor() !== null) {
        node.setBackgroundColor(null);
      }
    });
  }, [editor, hasCellBackgroundColor, hasCellMerge]);

  return null;
}
