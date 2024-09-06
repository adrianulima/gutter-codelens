import * as vscode from "vscode";

const decoratorsMap = new Map<string, vscode.TextEditorDecorationType>();
var commandsMap = new Map<number, vscode.Command | undefined>();

const createRefCountIcon = (count: number) => {
  const key = count.toString();
  if (!decoratorsMap.has(key)) {
    decoratorsMap.set(
      key,
      vscode.window.createTextEditorDecorationType({
        gutterIconPath: vscode.Uri.parse(
          `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"> <rect fill="none" x="0" y="0" width="100%" height="100%"/> <text x="100%" y="50%" fill="rgba(255, 255, 255, 0.6)" dominant-baseline="middle" text-anchor="end" font-size="25" font-family="Arial, Helvetica, sans-serif">${count}</text> </svg>`
        ),
        gutterIconSize: "contain",
      })
    );
  }
  return decoratorsMap.get(key);
};

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "codelens-position.showReferences",
    ({ lineNumber }) => {
      const command = commandsMap.get(lineNumber - 1);
      if (command && command.arguments) {
        vscode.commands.executeCommand(command.command, ...command.arguments);
      }
    }
  );

  context.subscriptions.push(disposable);

  async function getLens(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    return (
      (await vscode.commands.executeCommand<vscode.CodeLens[]>(
        "vscode.executeCodeLensProvider",
        document.uri,
        Number.MAX_VALUE
      )) || []
    );
  }

  async function getReferences(
    document: vscode.TextDocument,
    range: vscode.Range
  ): Promise<vscode.Location[]> {
    return (
      (await vscode.commands.executeCommand<vscode.Location[]>(
        "vscode.executeReferenceProvider",
        document.uri,
        new vscode.Position(range.start.line, range.start.character)
      )) || []
    );
  }

  let timeout: NodeJS.Timeout | undefined = undefined;
  let activeEditor = vscode.window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    getLens(activeEditor.document).then(async (lens) => {
      const decorators = (
        await Promise.all(
          lens.map((l) => {
            if (
              !activeEditor ||
              l.command?.command !== "editor.action.showReferences"
            ) {
              return;
            }
            commandsMap.set(l.range.start.line, l.command);
            return getReferences(activeEditor.document, l.range);
          })
        )
      ).reduce((acc: any, curr: vscode.Location[] | undefined, i: number) => {
        return !curr
          ? acc
          : {
              ...acc,
              [curr.length]: [...(acc[curr.length] || []), lens[i].range],
            };
      }, {});

      Object.keys(decorators).forEach(async (k) => {
        activeEditor?.setDecorations(
          createRefCountIcon(parseInt(k))!,
          decorators[k]
        );
      });
    });
  }

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500);
    } else {
      updateDecorations();
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
