import {
  CodeLens,
  commands,
  Location,
  Position,
  Range,
  Uri,
  workspace,
} from "vscode";

export async function executeCodeLensProvider(uri: Uri): Promise<CodeLens[]> {
  try {
    const config = workspace.getConfiguration("gutterCodelens");
    const maxLenses = config.get<number>("maxCodeLenses", 50);

    let limit = maxLenses;
    if (maxLenses === -1) {
      const initialResult = await commands.executeCommand<CodeLens[]>(
        "vscode.executeCodeLensProvider",
        uri,
        1,
      );

      if (initialResult && initialResult.length > 0) {
        const allResult = await commands.executeCommand<CodeLens[]>(
          "vscode.executeCodeLensProvider",
          uri,
        );
        limit = allResult ? allResult.length : Number.MAX_VALUE;
      }
    }

    const result = await commands.executeCommand<CodeLens[]>(
      "vscode.executeCodeLensProvider",
      uri,
      limit,
    );

    return result || [];
  } catch (error) {
    console.error("Error executing 'executeCodeLensProvider':", error);
    return [];
  }
}

export async function executeReferenceProvider(
  uri: Uri,
  range: Range,
): Promise<Location[]> {
  try {
    const result = await commands.executeCommand<Location[]>(
      "vscode.executeReferenceProvider",
      uri,
      new Position(range.start.line, range.start.character),
    );

    return result || [];
  } catch (error) {
    console.error("Error executing 'executeReferenceProvider':", error);
    return [];
  }
}
