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

  // async function getSymbols(
  //   document: vscode.TextDocument
  // ): Promise<vscode.SymbolInformation[]> {
  //   return (
  //     (await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
  //       "vscode.executeDocumentSymbolProvider",
  //       document.uri
  //     )) || []
  //   );
  // }

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

  // const gutterIcon = vscode.window.createTextEditorDecorationType({
  //   // gutterIconPath: vscode.Uri.parse(
  //   //   "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+PGxpbmVhckdyYWRpZW50IGlkPSdncmFkaWVudCc+PHN0b3Agb2Zmc2V0PScxMCUnIHN0b3AtY29sb3I9JyNGMDAnLz48c3RvcCBvZmZzZXQ9JzkwJScgc3RvcC1jb2xvcj0nI2ZjYycvPiA8L2xpbmVhckdyYWRpZW50PjxyZWN0IGZpbGw9J3VybCgjZ3JhZGllbnQpJyB4PScwJyB5PScwJyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJy8+PC9zdmc+"
  //   // ),
  //   gutterIconPath: vscode.Uri.parse(
  //     "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'> <rect fill='none' x='0' y='0' width='100%' height='100%'/> <text x='100%' y='50%' fill='white' dominant-baseline='middle' text-anchor='end' font-size='5' font-family='Arial, Helvetica, sans-serif'>14</text> </svg>"
  //   ),
  //   // gutterIconPath: context.asAbsolutePath("resources/edit.svg"),
  //   gutterIconSize: "contain",
  //   // overviewRulerColor: "red",
  //   // overviewRulerLane: vscode.OverviewRulerLane.Right,
  //   // rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  // });

  let timeout: NodeJS.Timeout | undefined = undefined;
  let activeEditor = vscode.window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    getLens(activeEditor.document).then((lens) => {
      if (!activeEditor) {
        return;
      }
      console.log("getLens Length:", JSON.stringify(lens));

      lens.forEach(async (l) => {
        if (!activeEditor) {
          return;
        }
        // console.log(
        //   "getLens Item:",
        //   l.range.start.line,
        //   await getReferences(activeEditor.document, l.range)
        // );
        getReferences(activeEditor.document, l.range).then((refs) =>
          activeEditor?.setDecorations(createRefCountIcon(refs.length), [
            l.range,
          ])
        );
      });

      // const range = lens.map((l) => l.range);
      // activeEditor.setDecorations(gutterIcon, range);
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
