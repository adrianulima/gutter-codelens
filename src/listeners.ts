import { window, workspace, ExtensionContext } from "vscode";
import {
  debouncedUpdateDecorations,
  removeDecorationsAndCommands,
  disposeEditorStateByUri,
  updateDecorationsForEditor,
} from "./decorations";
import { disposeDecorations } from "./svgGenerator";

export function registerEventListeners(context: ExtensionContext) {
  window.onDidChangeActiveTextEditor(
    (editor) => {
      const settings = workspace.getConfiguration("gutterCodelens");
      if (!settings.get("showUnfocused")) {
        removeDecorationsAndCommands();
        // disposeAllDecorations();
      }

      if (editor) {
        updateDecorationsForEditor(editor);
      }
    },
    null,
    context.subscriptions,
  );

  workspace.onDidOpenTextDocument(
    (event) => {
      console.log("Opened document:", event.uri);
    },
    null,
    context.subscriptions,
  );

  workspace.onDidChangeTextDocument(
    (event) => {
      if (event.document === window.activeTextEditor?.document) {
        debouncedUpdateDecorations();
      }
    },
    null,
    context.subscriptions,
  );

  workspace.onDidCloseTextDocument(
    function (event) {
      if (event.uri) {
        disposeEditorStateByUri(event.uri);
      }
    },
    null,
    context.subscriptions,
  );

  workspace.onDidChangeConfiguration(
    function (event) {
      if (event.affectsConfiguration("gutterCodelens")) {
        removeDecorationsAndCommands();
        disposeDecorations();
      }
    },
    null,
    context.subscriptions,
  );
}
