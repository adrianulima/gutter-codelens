import { window, workspace, ExtensionContext } from "vscode";
import {
  debouncedUpdateDecorations,
  disposeEditorStateByUri,
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

  workspace.onDidCloseTextDocument(
    function (event) {
      if (event.uri) {
        disposeEditorStateByUri(event.uri);
      }
    },
    null,
    context.subscriptions
  );
}
