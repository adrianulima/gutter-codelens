import {
  Command,
  commands,
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
  window,
} from "vscode";
import { getLensSvgIcon } from "./svgGenerator";
import { executeCodeLensProvider, executeReferenceProvider } from "./codelens";
import { debounce } from "./utils";

const commandsMap = new Map<string, Command | undefined>();
const decoratorsMap = new Map<TextEditor, TextEditorDecorationType[]>();

const uriLineKey = (uri: Uri, line: number) => `${uri.toString()}_${line}`;
export const getCommand = (uri: Uri, line: number) =>
  commandsMap.get(uriLineKey(uri, line));

export function clearAllDecorations() {
  decoratorsMap.forEach((decorations, editor) => {
    decorations.forEach((d) => {
      editor.setDecorations(d, []);
    });
  });

  commandsMap.clear();
  decoratorsMap.clear();
}

export function clearDecorations(activeEditor: TextEditor) {
  if (!decoratorsMap.has(activeEditor)) {
    return;
  }

  decoratorsMap.get(activeEditor)?.forEach((d) => {
    activeEditor.setDecorations(d, []);
  });
  decoratorsMap.delete(activeEditor);
}

const updateContext = (ranges: { [key: string]: Range[] }) => {
  commands.executeCommand(
    "setContext",
    "gutter-codelens.referenceLines",
    Object.values(ranges)
      .flat()
      .map((r: Range) => r.start.line + 1)
  );

  if (ranges["lens"]?.length) {
    commands.executeCommand(
      "setContext",
      "gutter-codelens.lensLines",
      ranges["lens"].map((r: Range) => r.start.line + 1)
    );
  }
};

export async function updateDecorationsForEditor(activeEditor: TextEditor) {
  try {
    const lens = await executeCodeLensProvider(activeEditor.document.uri);
    const ranges: Record<string, Range[]> = {};

    for (const l of lens) {
      commandsMap.set(
        uriLineKey(activeEditor.document.uri, l.range.start.line),
        l.command
      );

      let key = "lens";
      if (l.command?.command === "editor.action.showReferences") {
        try {
          const references = await executeReferenceProvider(
            activeEditor.document.uri,
            l.range
          );
          key = references.length.toString();
        } catch (error) {
          console.error(
            `Failed to execute reference provider for line ${l.range.start.line}:`,
            error
          );
        }
      }

      if (!ranges[key]) {
        ranges[key] = [];
      }
      ranges[key].push(l.range);
    }

    clearDecorations(activeEditor);

    const decorationTypes: TextEditorDecorationType[] = [];
    for (const [key, rangesArray] of Object.entries(ranges)) {
      const svg = getLensSvgIcon(key);
      decorationTypes.push(svg);
      activeEditor.setDecorations(svg, rangesArray);
    }
    decoratorsMap.set(activeEditor, decorationTypes);

    updateContext(ranges);
  } catch (error) {
    console.error("Failed to update decorations:", error);
  }
}

export const updateDecorations = () => {
  if (window.activeTextEditor) {
    updateDecorationsForEditor(window.activeTextEditor);
  }
};

export const debouncedUpdateDecorations = debounce(updateDecorations, 500);
