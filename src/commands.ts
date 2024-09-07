import { commands, ExtensionContext, Uri, window } from "vscode";
import { getLineCommand } from "./decorations";

export const codelensCommandCall = ({
  lineNumber,
  uri,
}: { lineNumber?: number; uri?: Uri } = {}) => {
  const line = lineNumber ?? window.activeTextEditor?.selection.active.line;
  const documentUri = window.activeTextEditor?.document.uri;

  if (uri?.toString() !== documentUri?.toString()) {
    console.warn("Command ignored, clicked inactive editor gutter lens.");
    return;
  }

  if (line === undefined || !documentUri) {
    console.warn("Line number or document URI is missing.");
    return;
  }

  const command = getLineCommand(documentUri, line - 1);
  if (command?.command && command.arguments) {
    try {
      commands.executeCommand(command.command, ...command.arguments);
    } catch (error) {
      console.error(`Failed to execute command: ${command.command}`, error);
    }
  } else {
    console.warn(`No command found for line ${line} at ${documentUri}`);
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
