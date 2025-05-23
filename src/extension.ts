import * as vscode from "vscode";

const supported = ["javascript", "javascriptreact", "vue", "typescript"];

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("vsc-easy-log.log", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("No active editor");

      return;
    }

    if (!supported.includes(editor.document.languageId)) {
      vscode.window.showErrorMessage(
        `${editor.document.languageId} language is not supported`
      );

      return;
    }

    const cursorPosition = editor.selection.active;

    // Use word range at cursor to get the variable under the cursor
    const wordRange = editor.document.getWordRangeAtPosition(
      cursorPosition,
      /[\w.$]+/
    );

    if (!wordRange) {
      vscode.window.showWarningMessage("No variable under cursor");

      return;
    }

    const variableText = editor.document.getText(wordRange).trim();

    // Split the variable by dots to handle nested properties
    const parts = variableText.split(".");

    if (parts.length === 0) {
      vscode.window.showWarningMessage("No valid variable under cursor");

      return;
    }

    // Validate each part of the variable name
    const isValidVariable = parts.every((part) =>
      /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(part)
    );

    if (!isValidVariable) {
      vscode.window.showWarningMessage("Invalid variable name under cursor");

      return;
    }

    // Calculate the cursor's relative position within the variable text
    const cursorOffset = editor.document.offsetAt(cursorPosition);
    const wordStartOffset = editor.document.offsetAt(wordRange.start);
    const relativeCursorOffset = cursorOffset - wordStartOffset;

    // Determine which part of the variable the cursor is on
    let variableToLog = variableText;

    if (parts.length > 1) {
      let currentOffset = 0;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const partLength = part.length;
        const nextOffset =
          currentOffset + partLength + (i < parts.length - 1 ? 1 : 0); // Account for dot

        if (
          relativeCursorOffset >= currentOffset &&
          relativeCursorOffset <= nextOffset
        ) {
          // Cursor is on this part
          if (i === 0) {
            // Cursor is on the root object (e.g., `object` in `object.variable`)
            variableToLog = parts[0];
          } else {
            // Cursor is on a nested property (e.g., `variable` in `object.variable`)
            variableToLog = parts.slice(0, i + 1).join(".");
          }
          break;
        }

        currentOffset = nextOffset;
      }
    }

    const debugLine = `\nconsole.log("====== ${variableToLog} =====", ${variableToLog});\n`;

    editor.edit((editBuilder) => {
      // Insert after the current line
      const position = new vscode.Position(
        cursorPosition.line,
        Number.MAX_SAFE_INTEGER
      );

      editBuilder.insert(position, debugLine);
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
