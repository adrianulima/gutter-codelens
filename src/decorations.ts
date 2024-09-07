import {
  Command,
  commands,
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
  window,
} from "vscode";
import { getLensSvgDecorationType } from "./svg";
import { executeCodeLensProvider, executeReferenceProvider } from "./codelens";
import { debounce } from "./utils";

type TEditorState = {
  decorations: TextEditorDecorationType[];
  commands: Map<number, Command | undefined>;
};

const editorsMap = new Map<TextEditor, TEditorState>();

function getEditorStateByUri(uri: Uri) {
  for (const [key, value] of editorsMap.entries()) {
    if (key.document.uri.toString() === uri.toString()) {
      return { editor: key, state: value };
    }
  }
}

export const getLineCommand = (uri: Uri, line: number) => {
  return getEditorStateByUri(uri)?.state.commands.get(line);
};

export function disposeEditorStateByUri(uri: Uri) {
  const editorState = getEditorStateByUri(uri);
  if (!editorState) {
    return;
  }

  editorState.state.decorations.forEach((d) =>
    editorState.editor.setDecorations(d, []),
  );
  editorState.state.decorations = [];
  editorState.state.commands.clear();
  editorsMap.delete(editorState.editor);
}

export function removeDecorationsAndCommands() {
  editorsMap.forEach((editorState, editor) => {
    editorState.decorations.forEach((d) => editor.setDecorations(d, []));
    editorState.decorations = [];
    editorState.commands.clear();
  });

  editorsMap.clear();
}

const updateContext = (ranges: { [key: string]: Range[] }) => {
  commands.executeCommand(
    "setContext",
    "gutter-codelens.referenceLines",
    Object.values(ranges)
      .flat()
      .map((r: Range) => r.start.line + 1),
  );

  if (ranges["lens"]?.length) {
    commands.executeCommand(
      "setContext",
      "gutter-codelens.lensLines",
      ranges["lens"].map((r: Range) => r.start.line + 1),
    );
  }
};

const initOrGetEditorState = (editor: TextEditor) => {
  let editorState = editorsMap.get(editor);
  if (!editorState) {
    editorState = {
      decorations: [],
      commands: new Map<number, Command | undefined>(),
    };
    editorsMap.set(editor, editorState);
  }
  return editorState;
};

export async function updateDecorationsForEditor(activeEditor: TextEditor) {
  try {
    const lens = await executeCodeLensProvider(activeEditor.document.uri);
    const ranges: Record<string, Range[]> = {};
    const editorState = initOrGetEditorState(activeEditor);

    for (const l of lens) {
      editorState.commands.set(l.range.start.line, l.command);

      let key = "lens";
      if (l.command?.command === "editor.action.showReferences") {
        try {
          const references = await executeReferenceProvider(
            activeEditor.document.uri,
            l.range,
          );
          key = references.length.toString();
        } catch (error) {
          console.error(
            `Failed to execute reference provider for line ${l.range.start.line}:`,
            error,
          );
        }
      }

      if (!ranges[key]) {
        ranges[key] = [];
      }
      ranges[key].push(l.range);
    }

    editorState.decorations.forEach((d) => activeEditor.setDecorations(d, []));
    editorState!.decorations = [];

    for (const [key, rangesArray] of Object.entries(ranges)) {
      const svgDecorationType = getLensSvgDecorationType(key);
      editorState.decorations.push(svgDecorationType);
      activeEditor.setDecorations(svgDecorationType, rangesArray);
    }

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
