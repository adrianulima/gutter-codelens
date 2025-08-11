import { workspace, commands, Uri, SymbolKind, DocumentSymbol } from "vscode";

export const debounce = (callback: () => void, delay?: number) => {
  let timeoutId: NodeJS.Timeout | undefined;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const actualDelay =
      delay ??
      workspace
        .getConfiguration("gutterCodelens")
        .get<number>("debounceMs", 500);
    timeoutId = setTimeout(callback, actualDelay);
  };
};

export async function getDocumentSymbols(uri: Uri): Promise<DocumentSymbol[]> {
  try {
    const symbols = await commands.executeCommand<DocumentSymbol[]>(
      "vscode.executeDocumentSymbolProvider",
      uri,
    );
    return symbols || [];
  } catch (error) {
    console.error("Error getting document symbols:", error);
    return [];
  }
}

export function extractFunctionLines(symbols: DocumentSymbol[]): Set<number> {
  const functionLines = new Set<number>();

  function processSymbols(symbolList: DocumentSymbol[]) {
    for (const symbol of symbolList) {
      if (
        symbol.kind === SymbolKind.Function ||
        symbol.kind === SymbolKind.Method ||
        symbol.kind === SymbolKind.Constructor
      ) {
        functionLines.add(symbol.range.start.line);
      }

      if (symbol.children && symbol.children.length > 0) {
        processSymbols(symbol.children);
      }
    }
  }

  processSymbols(symbols);
  return functionLines;
}
