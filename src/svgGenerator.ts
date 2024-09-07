import { TextEditorDecorationType, Uri, window } from "vscode";

type TSvgSettings = {
  icon: {
    single: { x: number; y: number };
    x: number;
    y: number;
    color: string;
    hidden: boolean;
  };
  text: { x: number; y: number; color: string };
};

const decoratorsMap = new Map<string, TextEditorDecorationType>();

const getEyeIcon = (x: number, y: number, rgba: string) => {
  const width = 24;
  const height = 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="none"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 13.6394 2.42496 14.1915 3.27489 15.2957C4.97196 17.5004 7.81811 20 12 20C16.1819 20 19.028 17.5004 20.7251 15.2957C21.575 14.1915 22 13.6394 22 12C22 10.3606 21.575 9.80853 20.7251 8.70433C19.028 6.49956 16.1819 4 12 4C7.81811 4 4.97196 6.49956 3.27489 8.70433C2.42496 9.80853 2 10.3606 2 12ZM12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="${rgba}"></path></svg>`;
};

const getSvgWithSettings = (key: string, settings: TSvgSettings) => {
  return Uri.parse(
    key === "lens"
      ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42">${getEyeIcon(
          settings.icon.single.x,
          settings.icon.single.y,
          settings.icon.color,
        )}</svg>`
      : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54"><text x="75%" y="50%" fill="${settings.text.color}" dominant-baseline="middle" text-anchor="middle" font-size="25" font-family="Arial, Helvetica, sans-serif">${key}</text>${getEyeIcon(
          settings.icon.x,
          settings.icon.y,
          settings.icon.color,
        )}</svg>`,
  );
};

export const getLensSvgDecorationType = (
  key: string,
): TextEditorDecorationType => {
  if (!decoratorsMap.has(key)) {
    const svgSettingsDark = {
      icon: {
        single: { x: 9, y: 9 },
        x: 2,
        y: 12,
        color: "rgba(255, 255, 255, 0.4)",
        hidden: false,
      },
      text: { x: 0, y: 0, color: "rgba(255, 255, 255, 0.6)" },
    };
    const svgSettingsLight = {
      icon: { ...svgSettingsDark.icon, color: "rgba(0, 0, 0, 0.4)" },
      text: { ...svgSettingsDark.text, color: "rgba(0, 0, 0, 0.6)" },
    };
    decoratorsMap.set(
      key,
      window.createTextEditorDecorationType({
        dark: {
          gutterIconPath: getSvgWithSettings(key, svgSettingsDark),
          gutterIconSize: "contain",
        },
        light: {
          gutterIconPath: getSvgWithSettings(key, svgSettingsLight),
          gutterIconSize: "contain",
        },
      }),
    );
  }
  return decoratorsMap.get(key)!;
};
