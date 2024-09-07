import {
  commands,
  ExtensionContext,
  TextEditor,
  Uri,
  window,
  workspace,
} from "vscode";
import {
  clearAllDecorations,
  getCommand,
  updateDecorations,
} from "./decorationHandler";

const codelensCommandCall = ({
  lineNumber,
  uri,
}: { lineNumber?: number; uri?: Uri } = {}) => {
  const line = lineNumber || window.activeTextEditor?.selection.active.line;
  const documentUri = uri || window.activeTextEditor?.document.uri;
  if (!line || !documentUri) {
    return;
  }

  const command = getCommand(documentUri, line - 1);
  if (command && command.arguments) {
    commands.executeCommand(command.command, ...command.arguments);
  }
};

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "gutter-codelens.showReferences",
      codelensCommandCall
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      "gutter-codelens.codelensCommand",
      codelensCommandCall
    )
  );

  let timeout: NodeJS.Timeout | undefined = undefined;
  function triggerUpdateDecorations(
    activeEditor: TextEditor,
    throttle: boolean = false
  ) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(() => {
        updateDecorations(activeEditor);
      }, 500);
    } else {
      updateDecorations(activeEditor);
    }
  }

  if (window.activeTextEditor) {
    triggerUpdateDecorations(window.activeTextEditor);
  }

  window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        triggerUpdateDecorations(editor);
      }
    },
    null,
    context.subscriptions
  );

  workspace.onDidChangeTextDocument(
    (event) => {
      if (event.document === window.activeTextEditor?.document) {
        triggerUpdateDecorations(window.activeTextEditor, true);
      }
    },
    null,
    context.subscriptions
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  clearAllDecorations();
}
