import { commands, Uri, window } from "vscode";
import { getCommand } from "./decorations";

export const codelensCommandCall = ({
  lineNumber,
  uri,
}: { lineNumber?: number; uri?: Uri } = {}) => {
  const line = lineNumber ?? window.activeTextEditor?.selection.active.line;
  const documentUri = uri ?? window.activeTextEditor?.document.uri;

  if (line === undefined || !documentUri) {
    console.warn("Line number or document URI is missing.");
    return;
  }

  const command = getCommand(documentUri, line - 1);
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

export function registerCommands(context: any) {
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
}
