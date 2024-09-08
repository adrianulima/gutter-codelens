# Gutter CodeLens for VSCode

Gutter CodeLens is a Visual Studio Code extension that places CodeLens in the editor's gutter, separated from the native CodeLens. This improves code readability by keeping CodeLens compact and out of the main code area.

![gutter-codelens-preview](https://github.com/adrianulima/gutter-codelens/blob/main/assets/gutter-codelens-preview.png?raw=true)

## Features

- **Customizable Colors:** Easily customize the appearance of CodeLens with configurable colors to suit your theme and preferences.
- **Fast to Show Results:** The extension is optimized for quick updates, ensuring that CodeLens appears swiftly as you navigate your code.
- **Support for Custom CodeLens:** Works not just with reference counts but also with custom CodeLens commands, making it versatile for various use cases.
- **Context Menu Integration:** _[optional]_ Right-click on the gutter CodeLens to access "Show References" and other options, functioning similarly to the original CodeLens context menu.

![gutter-codelens-preview-gif](https://github.com/adrianulima/gutter-codelens/blob/main/assets/gutter-codelens-preview.gif?raw=true)

> [!TIP]
> You can still `CMD/Ctrl + Click` the Symbol to quickly open the peek view with references.
>
> Use the following setting if you want to make the `CMD/Ctrl + Click` action to always peek the references:

```json
  "editor.gotoLocation.alternativeDefinitionCommand": "editor.action.referenceSearch.trigger"
```

## Install

1. Go to [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=AdrianoLima.gutter-codelens).
2. Click the Install button.

### Requirements

This extension does not add the CodeLens feature itself; you still need to enable it for the language you want to use. For example, for TypeScript, you will need to add the following setting to your settings.json:

```json
"typescript.referencesCodeLens.enabled": true
```

To disable original CodeLens, you can set the following setting:

```json
"editor.codeLens": false
```

## Extension Settings

| Configuration                       | Default | Description                                                                                                                                                                |
| ----------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "gutterCodelens.showUnfocused"      | `true`  | If true, shows decorations for unfocused editors. Unfocused editors still won't update reference counts automatically and will keep previous values until focused again.   |
| "gutterCodelens.showReferencesIcon" | `true`  | If true, shows the icon besides the reference count in the gutter.                                                                                                         |
| "gutterCodelens.color"              | `""`    | Color of the reference count in the gutter. Should be using rgba() format. If empty, defaults to `rgba(255, 255, 255, 0.6)` on dark themes and equivalent on light themes. |
| "gutterCodelens.iconColor"          | `""`    | Color of the icon in the gutter. Should be using rgba() format. . If empty, defaults to `rgba(255, 255, 255, 0.4)` on dark themes and equivalent on light themes.          |

## Known Issues

- The extension currently works only for active editors. Unfocused editors will still show previous values, just like the original CodeLens.
- Right-clicking on an unfocused editor won't show the command in the context menu.
- There are some limitations from the VSCode API that prevents this extension from having more features like left click actions or mouse hover animations.

## Release Notes

### 0.1.0

This is the first version of the extension, primarily used for personal projects before a wider release. The next update will include any bug fixes and improvements based on user feedback. If you decide to use this extension, feel free to create issues for any bugs or suggestions.

## Contribute

Run the project locally:

```bash
git clone https://github.com/adrianulima/gutter-codelens.git
cd gutter-codelens
pnpm install
pnpm run watch
```
