import { CodeLens, commands, Location, Position, Range, Uri } from "vscode";

export async function executeCodeLensProvider(uri: Uri): Promise<CodeLens[]> {
  try {
    const result = await commands.executeCommand<CodeLens[]>(
      "vscode.executeCodeLensProvider",
      uri,
      Number.MAX_VALUE
    );

    return result || [];
  } catch (error) {
    console.error("Error executing 'executeCodeLensProvider':", error);
    return [];
  }
}

export async function executeReferenceProvider(
  uri: Uri,
  range: Range
): Promise<Location[]> {
  try {
    const result = await commands.executeCommand<Location[]>(
      "vscode.executeReferenceProvider",
      uri,
      new Position(range.start.line, range.start.character)
    );

    return result || [];
  } catch (error) {
    console.error("Error executing 'executeReferenceProvider':", error);
    return [];
  }
}
