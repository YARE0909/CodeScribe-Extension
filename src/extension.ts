import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

function isIrrelevantFile(filePath: string): boolean {
  const irrelevantDirs = ["node_modules", ".git", "__pycache__"];
  const irrelevantExtensions = [".log", ".tmp"];

  return (
    irrelevantDirs.some((dir) => filePath.includes(dir)) ||
    irrelevantExtensions.some((ext) => filePath.endsWith(ext))
  );
}

function getFilesInDirectory(directory: string): string[] {
  let files: string[] = [];

  function traverseDir(dir: string) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (isIrrelevantFile(fullPath)) {
        return;
      }

      if (stats.isDirectory()) {
        traverseDir(fullPath);
      } else if (stats.isFile()) {
        files.push(fullPath);
      }
    });
  }

  traverseDir(directory);
  return files;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.generateDocumentation",
    async () => {
      // Check if a workspace is open
      if (
        !vscode.workspace.workspaceFolders ||
        vscode.workspace.workspaceFolders.length === 0
      ) {
        vscode.window.showErrorMessage(
          "No workspace is open. Please open a folder to generate documentation."
        );
        console.error("Error: No workspace is open.");
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
      vscode.window.showInformationMessage(
        "Generating documentation... Please wait."
      );

      try {
        const files = getFilesInDirectory(workspaceFolder);

        if (files.length === 0) {
          vscode.window.showWarningMessage(
            "No valid code files found to document."
          );
          console.warn("Warning: No valid code files found in the workspace.");
          return;
        }

        const codeFiles = files.map((file) => ({
          path: file,
          content: fs.readFileSync(file, "utf-8"),
        }));

        // Show a progress notification
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating Documentation...",
            cancellable: false,
          },
          async () => {
            try {
              console.log("Sending code files to backend...");
              const response = await axios.post(
                "http://localhost:8000/document",
                { codeFiles }
              );

              // Save the documentation in the root folder
              const docFilePath = path.join(
                workspaceFolder,
                "documentation.md"
              );
              fs.writeFileSync(
                docFilePath,
                response.data.documentation,
                "utf-8"
              );

              vscode.window.showInformationMessage(
                "Documentation generated successfully!"
              );
              console.log(
                "Documentation successfully generated at:",
                docFilePath
              );

              vscode.workspace
                .openTextDocument(vscode.Uri.file(docFilePath))
                .then((doc) => {
                  vscode.window.showTextDocument(doc);
                });
            } catch (error: any) {
              console.error("Error during API request:", error);
              vscode.window.showErrorMessage(
                `CodeScribe Error | Error Code: ${error.code}`
              );

              // Create a dummy documentation file for testing purposes
              const dummyFilePath = path.join(workspaceFolder, "documentation.md");
              const dummyContent = "# Documentation\n\nThis is a dummy file created because the backend is not running.";
              fs.writeFileSync(dummyFilePath, dummyContent, "utf-8");

              vscode.window.showInformationMessage(
                "Backend not available. Dummy documentation file created."
              );
              console.log("Dummy documentation file created:", dummyFilePath);
            }
          }
        );
      } catch (error: any) {
        console.error("Unexpected error:", error);
        vscode.window.showErrorMessage(`Unexpected error: ${error.message}`);

        // Create a dummy documentation file for testing purposes
        const dummyFilePath = path.join(workspaceFolder, "documentation.md");
        const dummyContent = "# Documentation\n\nThis is a dummy file created due to an unexpected error.";
        fs.writeFileSync(dummyFilePath, dummyContent, "utf-8");

        vscode.window.showInformationMessage(
          "Unexpected error occurred. Dummy documentation file created."
        );
        console.log("Dummy documentation file created:", dummyFilePath);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
