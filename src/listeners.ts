import { window, workspace, ExtensionContext } from "vscode";
import {
  debouncedUpdateDecorations,
  updateDecorationsForEditor,
} from "./decorations";

export function registerEventListeners(context: ExtensionContext) {
  window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        updateDecorationsForEditor(editor);
      }
    },
    null,
    context.subscriptions
  );

  workspace.onDidChangeTextDocument(
    (event) => {
      if (event.document === window.activeTextEditor?.document) {
        debouncedUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );
}
