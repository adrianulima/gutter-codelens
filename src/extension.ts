// extension.ts
import { ExtensionContext } from "vscode";
import { registerCommands } from "./commands";
import { registerEventListeners } from "./listeners";

import { removeDecorationsAndCommands, updateDecorations } from "./decorations";
import { disposeDecorations } from "./svg";

export function activate(context: ExtensionContext) {
  registerCommands(context);
  registerEventListeners(context);

  updateDecorations();
}

export function deactivate() {
  removeDecorationsAndCommands();
  disposeDecorations();
}
