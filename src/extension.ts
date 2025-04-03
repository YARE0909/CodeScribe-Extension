import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

// Configuration for file handling
const IGNORED_DIRS = ["node_modules", ".git", "__pycache__", "dist", "build"];
const IGNORED_EXTENSIONS = [
  ".log",
  ".tmp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".pdf",
  ".md"
];
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

function isRelevantFile(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();

  return !(
    IGNORED_DIRS.some((dir) => normalizedPath.includes(dir.toLowerCase())) ||
    IGNORED_EXTENSIONS.some((ext) => normalizedPath.endsWith(ext)) ||
    fs.statSync(filePath).size > MAX_FILE_SIZE
  );
}

async function getCodeFiles(
  rootDir: string
): Promise<Array<{ path: string; content: string }>> {
  const codeFiles: Array<{ path: string; content: string }> = [];

  async function traverseDirectory(dir: string) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (isRelevantFile(fullPath)) {
          await traverseDirectory(fullPath);
        }
      } else if (entry.isFile() && isRelevantFile(fullPath)) {
        try {
          const content = await fs.promises.readFile(fullPath, "utf-8");
          codeFiles.push({
            path: path.relative(rootDir, fullPath),
            content: content,
          });
        } catch (error) {
          console.warn(`Could not read file ${fullPath}: ${error}`);
        }
      }
    }
  }

  await traverseDirectory(rootDir);
  return codeFiles;
}

export async function activate(context: vscode.ExtensionContext) {
  const commandId = "codeScribe.generateDocumentation";

  const commands = await vscode.commands.getCommands();
  if (!commands.includes(commandId)) {
    const disposable = vscode.commands.registerCommand(commandId, async () => {
      const workspace = vscode.workspace;

      if (!workspace.workspaceFolders?.[0]) {
        vscode.window.showErrorMessage("Please open a workspace folder first.");
        return;
      }

      const rootPath = workspace.workspaceFolders[0].uri.fsPath;
      const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
      );

      try {
        statusBar.text = "$(sync~spin) Collecting code files...";
        statusBar.show();

        const codeFiles = await getCodeFiles(rootPath);

        if (codeFiles.length === 0) {
          vscode.window.showWarningMessage("No code files found to document.");
          return;
        }

        statusBar.text = "$(sync~spin) Generating documentation...";

        const response = await axios.post(
          "http://localhost:8000/document",
          {
            codeFiles,
          },
          {
            timeout: 120000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const docPath = path.join(rootPath, "CODE_DOCUMENTATION.md");
        await fs.promises.writeFile(docPath, response.data.documentation);

        vscode.window.showInformationMessage(
          "Documentation generated successfully!"
        );
        vscode.window.showTextDocument(vscode.Uri.file(docPath));
      } catch (error: any) {
        console.error("Documentation generation failed:", error);

        const message =
          error.response?.data?.detail ||
          error.message ||
          "Documentation generation failed";
        vscode.window.showErrorMessage(`CodeScribe Error: ${message}`);
      } finally {
        statusBar.dispose();
      }
    });

    context.subscriptions.push(disposable);
  }
}

export function deactivate() {}
