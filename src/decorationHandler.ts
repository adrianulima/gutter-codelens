import {
  Command,
  commands,
  Location,
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
} from "vscode";
import { getLensSvgIcon } from "./svgGenerator";
import { executeCodeLensProvider, executeReferenceProvider } from "./codelens";

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
  const key = activeEditor.document.uri.toString();
  if (!decoratorsMap.has(activeEditor)) {
    return;
  }

  decoratorsMap.get(activeEditor)?.forEach((d) => {
    activeEditor.setDecorations(d, []);
  });
  decoratorsMap.delete(activeEditor);
}

export function updateDecorations(activeEditor: TextEditor) {
  executeCodeLensProvider(activeEditor.document.uri).then(async (lens) => {
    const ranges: { [key: string]: Range[] } = (
      await Promise.all(
        lens.map((l) => {
          commandsMap.set(
            uriLineKey(activeEditor.document.uri, l.range.start.line),
            l.command
          );
          if (l.command?.command === "editor.action.showReferences") {
            return executeReferenceProvider(activeEditor.document.uri, l.range);
          }
        })
      )
    ).reduce((acc: any, curr: Location[] | undefined, i: number) => {
      const key = curr?.length ?? "lens";
      return {
        ...acc,
        [key]: [...(acc[key] || []), lens[i].range],
      };
    }, {});

    clearDecorations(activeEditor);

    const decorationTypes: TextEditorDecorationType[] = [];
    Object.keys(ranges).forEach(async (k) => {
      const svg = getLensSvgIcon(k);
      decorationTypes.push(svg);
      activeEditor?.setDecorations(svg, ranges[k]);
    });
    decoratorsMap.set(activeEditor, decorationTypes);

    updateContext(ranges);
  });
}

const updateContext = (ranges: { [key: string]: Range[] }) => {
  commands.executeCommand(
    "setContext",
    "gutter-codelens.referenceLines",
    Object.values(ranges)
      .flat()
      .map((r: any) => r.start.line + 1)
  );

  if (ranges["lens"]?.length) {
    commands.executeCommand(
      "setContext",
      "gutter-codelens.lensLines",
      ranges["lens"].map((r: any) => r.start.line + 1)
    );
  }
};
