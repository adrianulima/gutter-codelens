import { commands, ExtensionContext, Uri, window } from "vscode";
import { getLineCommand } from "./decorations";

export const codelensCommandCall = ({
  lineNumber,
  uri,
}: { lineNumber?: number; uri?: Uri } = {}) => {
  const activeEditor = window.activeTextEditor;
  const line = lineNumber ?? activeEditor?.selection.active.line;
  const documentUri = activeEditor?.document.uri;

  if (!activeEditor || !documentUri) {
    console.warn("No active editor or document URI available.");
    return;
  }

  if (uri && uri.toString() !== documentUri.toString()) {
    console.warn("Command ignored: clicked on inactive editor gutter lens.");
    return;
  }

  if (line === undefined) {
    console.warn("Line number is missing for CodeLens command.");
    return;
  }

  const adjustedLine = typeof lineNumber === "number" ? line - 1 : line;

  try {
    const command = getLineCommand(documentUri, adjustedLine);
    if (command?.command) {
      const args = command.arguments || [];
      commands.executeCommand(command.command, ...args);
      console.debug(
        `Executed command: ${command.command} for line ${line + 1}`,
      );
    } else {
      console.warn(
        `No command found for line ${line + 1} in ${documentUri.fsPath}`,
      );
    }
  } catch (error) {
    console.error(`Failed to execute command for line ${line + 1}:`, error);
  }
};

export function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      "gutter-codelens.showReferences",
      codelensCommandCall,
    ),
  );

  context.subscriptions.push(
    commands.registerCommand(
      "gutter-codelens.codelensCommand",
      codelensCommandCall,
    ),
  );
}
