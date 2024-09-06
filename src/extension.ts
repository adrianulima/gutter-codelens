import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "codelens-position" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "codelens-position.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from codelens-position!"
      );
    }
  );

  context.subscriptions.push(disposable);

  async function getLens(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    return (
      (await vscode.commands.executeCommand<vscode.CodeLens[]>(
        "vscode.executeCodeLensProvider",
        document.uri
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

  // TODO: cache repeated
  const createRefCountIcon = (count: number) =>
    vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"> <rect fill="none" x="0" y="0" width="100%" height="100%"/> <text x="100%" y="50%" fill="white" dominant-baseline="middle" text-anchor="end" font-size="25" font-family="Arial, Helvetica, sans-serif">${count}</text> </svg>`
      ),
      gutterIconSize: "contain",
    });

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
            if (!activeEditor) {
              return;
            }
            return getReferences(activeEditor.document, l.range);
          })
        )
      )
        .map((refs) => refs?.length ?? 0)
        .reduce((acc: any, curr: number, i: number) => {
          return { ...acc, [curr]: [...(acc[curr] || []), lens[i].range] };
        }, {});

      Object.keys(decorators).forEach(async (k) => {
        activeEditor?.setDecorations(
          createRefCountIcon(parseInt(k)),
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
