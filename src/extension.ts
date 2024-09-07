// extension.ts
import { ExtensionContext } from "vscode";
import { registerCommands } from "./commands";
import { registerEventListeners } from "./listeners";

import {
  disposeAllDecorationsAndCommands,
  updateDecorations,
} from "./decorations";

export function activate(context: ExtensionContext) {
  registerCommands(context);
  registerEventListeners(context);

  updateDecorations();
}

export function deactivate() {
  disposeAllDecorationsAndCommands();
}
