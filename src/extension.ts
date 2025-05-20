import * as vscode from "vscode";

const supported = ["javascript", "javascriptreact", "vue", "typescript"];

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("vsc-easy-log.log", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("No active editor");

      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection).trim();

    if (!selectedText) {
      vscode.window.showWarningMessage("No variable selected");

      return;
    }

    if (!supported.includes(editor.document.languageId)) {
      vscode.window.showErrorMessage(
        `${editor.document.languageId} language is not supported`
      );

      return;
    }

    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(selectedText)) {
      vscode.window.showWarningMessage("Invalid variable name selected");

      return;
    }

    const debugLine = `\nconsole.log("====== ${selectedText} =====", ${selectedText});\n`;

    editor.edit((editBuilder) => {
      // Insert after the current line
      const position = new vscode.Position(
        selection.end.line,
        Number.MAX_SAFE_INTEGER
      );
      editBuilder.insert(position, debugLine);
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
