import * as vscode from "vscode";

// const genericSVG = `<svg xmlns="http://www.w3.org/2000/svg" x="9" y="9" width="24" height="24" fill="none" stroke="none"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 13.6394 2.42496 14.1915 3.27489 15.2957C4.97196 17.5004 7.81811 20 12 20C16.1819 20 19.028 17.5004 20.7251 15.2957C21.575 14.1915 22 13.6394 22 12C22 10.3606 21.575 9.80853 20.7251 8.70433C19.028 6.49956 16.1819 4 12 4C7.81811 4 4.97196 6.49956 3.27489 8.70433C2.42496 9.80853 2 10.3606 2 12ZM12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="rgba(255, 255, 255, 0.4)"></path></svg>`;
// const refIcon = `<svg xmlns="http://www.w3.org/2000/svg" x="2" y="12" width="24" height="24" fill="none" stroke="none"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 13.6394 2.42496 14.1915 3.27489 15.2957C4.97196 17.5004 7.81811 20 12 20C16.1819 20 19.028 17.5004 20.7251 15.2957C21.575 14.1915 22 13.6394 22 12C22 10.3606 21.575 9.80853 20.7251 8.70433C19.028 6.49956 16.1819 4 12 4C7.81811 4 4.97196 6.49956 3.27489 8.70433C2.42496 9.80853 2 10.3606 2 12ZM12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="rgba(255, 255, 255, 0.4)"></path></svg>`;
const decoratorsMap = new Map<string, vscode.TextEditorDecorationType>();

const getEyeIcon = (
  x: number,
  y: number,
  rgba: string = "rgba(255, 255, 255, 0.4)"
) => {
  const width = 24;
  const height = 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="none"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 13.6394 2.42496 14.1915 3.27489 15.2957C4.97196 17.5004 7.81811 20 12 20C16.1819 20 19.028 17.5004 20.7251 15.2957C21.575 14.1915 22 13.6394 22 12C22 10.3606 21.575 9.80853 20.7251 8.70433C19.028 6.49956 16.1819 4 12 4C7.81811 4 4.97196 6.49956 3.27489 8.70433C2.42496 9.80853 2 10.3606 2 12ZM12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="${rgba}"></path></svg>`;
};

export const getLensSvgIcon = (
  key: string
): vscode.TextEditorDecorationType => {
  if (!decoratorsMap.has(key)) {
    decoratorsMap.set(
      key,
      vscode.window.createTextEditorDecorationType({
        gutterIconPath: vscode.Uri.parse(
          key === "lens"
            ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42">${getEyeIcon(
                9,
                9
              )}</svg>`
            : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54"><text x="75%" y="50%" fill="rgba(255, 255, 255, 0.6)" dominant-baseline="middle" text-anchor="middle" font-size="25" font-family="Arial, Helvetica, sans-serif">${key}</text>${getEyeIcon(
                2,
                12
              )}</svg>`
        ),
        gutterIconSize: "contain",
      })
    );
  }
  return decoratorsMap.get(key)!;
};
