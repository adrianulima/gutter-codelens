// extension.ts
import { ExtensionContext } from "vscode";
import { registerCommands } from "./commands";
import { registerEventListeners } from "./listeners";

import {
  disposeAllDecorationsAndCommands,
  updateDecorations,
} from "./decorations";
import { disposeAllDecorations } from "./svgGenerator";

export function activate(context: ExtensionContext) {
  registerCommands(context);
  registerEventListeners(context);

  updateDecorations();
}

export function deactivate() {
  disposeAllDecorationsAndCommands();
  disposeAllDecorations();
}
