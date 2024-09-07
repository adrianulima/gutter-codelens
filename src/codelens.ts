import { CodeLens, commands, Location, Position, Range, Uri } from "vscode";

export async function executeCodeLensProvider(uri: Uri): Promise<CodeLens[]> {
  return (
    (await commands.executeCommand<CodeLens[]>(
      "vscode.executeCodeLensProvider",
      uri,
      Number.MAX_VALUE
    )) || []
  );
}

export async function executeReferenceProvider(
  uri: Uri,
  range: Range
): Promise<Location[]> {
  return (
    (await commands.executeCommand<Location[]>(
      "vscode.executeReferenceProvider",
      uri,
      new Position(range.start.line, range.start.character)
    )) || []
  );
}
