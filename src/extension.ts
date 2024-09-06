import * as vscode from "vscode";

const genericSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><svg x="8" y="8"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg></svg>`;
const refIcon = `<svg xmlns="http://www.w3.org/2000/svg" x="2" y="12" width="24" height="24" fill="none" stroke="none"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 13.6394 2.42496 14.1915 3.27489 15.2957C4.97196 17.5004 7.81811 20 12 20C16.1819 20 19.028 17.5004 20.7251 15.2957C21.575 14.1915 22 13.6394 22 12C22 10.3606 21.575 9.80853 20.7251 8.70433C19.028 6.49956 16.1819 4 12 4C7.81811 4 4.97196 6.49956 3.27489 8.70433C2.42496 9.80853 2 10.3606 2 12ZM12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="rgba(255, 255, 255, 0.4)"></path></svg>`;
const decoratorsMap = new Map<string, vscode.TextEditorDecorationType>();
var commandsMap = new Map<number, vscode.Command | undefined>();

const getLensIcon = (key: string) => {
  if (!decoratorsMap.has(key)) {
    decoratorsMap.set(
      key,
      vscode.window.createTextEditorDecorationType({
        gutterIconPath: vscode.Uri.parse(
          key === "lens"
            ? `data:image/svg+xml;utf8,${genericSVG}`
            : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54"><text x="75%" y="50%" fill="rgba(255, 255, 255, 0.6)" dominant-baseline="middle" text-anchor="middle" font-size="25" font-family="Arial, Helvetica, sans-serif">${key}</text>${refIcon}</svg>`
        ),
        gutterIconSize: "contain",
      })
    );
  }
  return decoratorsMap.get(key);
};

export function activate(context: vscode.ExtensionContext) {
  const commandFunc = ({ lineNumber }: { lineNumber?: number } = {}) => {
    const line =
      lineNumber || vscode.window.activeTextEditor?.selection.active.line;

    if (!line) {
      return;
    }
    const command = commandsMap.get(line - 1);
    if (command && command.arguments) {
      vscode.commands.executeCommand(command.command, ...command.arguments);
    }
  };

  const showReferencesCommand = vscode.commands.registerCommand(
    "codelens-position.showReferences",
    commandFunc
  );
  context.subscriptions.push(showReferencesCommand);

  const codelensCommand = vscode.commands.registerCommand(
    "codelens-position.codelensCommand",
    commandFunc
  );
  context.subscriptions.push(codelensCommand);

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
            if (!activeEditor) {
              return;
            }

            commandsMap.set(l.range.start.line, l.command);

            if (l.command?.command !== "editor.action.showReferences") {
              return;
            }

            return getReferences(activeEditor.document, l.range);
          })
        )
      ).reduce((acc: any, curr: vscode.Location[] | undefined, i: number) => {
        const key = curr?.length ?? "lens";
        return {
          ...acc,
          [key]: [...(acc[key] || []), lens[i].range],
        };
      }, {});

      Object.keys(decorators).forEach(async (k) => {
        activeEditor?.setDecorations(getLensIcon(k)!, decorators[k]);
      });

      vscode.commands.executeCommand(
        "setContext",
        "codelens-position.referenceLines",
        Object.values(decorators)
          .flat()
          .map((r: any) => r.start.line + 1)
      );

      if (decorators["lens"]?.length) {
        vscode.commands.executeCommand(
          "setContext",
          "codelens-position.lensLines",
          decorators["lens"].map((r: any) => r.start.line + 1)
        );
      }
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
