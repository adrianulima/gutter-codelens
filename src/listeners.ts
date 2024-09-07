import { window, workspace, ExtensionContext } from "vscode";
import {
  debouncedUpdateDecorations,
  disposeAllDecorationsAndCommands,
  disposeEditorStateByUri,
  updateDecorationsForEditor,
} from "./decorations";

export function registerEventListeners(context: ExtensionContext) {
  window.onDidChangeActiveTextEditor(
    (editor) => {
      const settings = workspace.getConfiguration("gutterCodelens");
      if (!settings.get("showUnfocused")) {
        disposeAllDecorationsAndCommands();
      }

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

  workspace.onDidChangeConfiguration(
    function (event) {
      if (event.affectsConfiguration("gutterCodelens")) {
        disposeAllDecorationsAndCommands();
      }
    },
    null,
    context.subscriptions
  );
}
