# CodeScribe - VS Code Extension for Automated Code Documentation

**CodeScribe** is a VS Code extension that helps generate comprehensive documentation for your codebase. It analyzes the code in your project and generates a detailed markdown file (`documentation.md`) that describes the functions, classes, and important components of the code.

This extension integrates with a backend that uses the **Phi-2 model** to generate the documentation for the given code files. If the backend is unavailable, the extension will generate a dummy file to ensure that the code processing works as expected.



## Features

- **Automatic Documentation Generation**: Automatically generates documentation for your codebase in markdown format (`documentation.md`).
- **Customizable Backend Integration**: The backend is powered by the **Phi-2 model**, which uses AI to generate detailed and structured documentation for the code.
- **Backend Fallback**: If the backend is not available, the extension will generate a dummy documentation file, ensuring functionality.
- **File Exclusions**: Automatically skips irrelevant files such as `node_modules`, `.git`, and `__pycache__` to ensure only relevant code is processed.
- **Progress Notifications**: The extension shows a progress indicator when generating documentation.



## Installation

### Prerequisites

1. **VS Code**: You need to have Visual Studio Code installed. You can download it from [here](https://code.visualstudio.com/).
2. **Node.js**: The extension is developed using Node.js. Make sure you have Node.js installed. You can download it from [here](https://nodejs.org/).

### Steps to Install the Extension

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/CodeScribe.git
   cd CodeScribe
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Open the extension folder in VS Code:
   ```bash
   code .
   ```

4. Press `F5` to run the extension in debug mode. This will open a new VS Code window with your extension loaded.

5. Once loaded, open your project folder in VS Code and run the **Generate Documentation** command from the Command Palette (`Ctrl+Shift+P`).



## Usage

Once installed, follow these steps to generate documentation for your codebase:

1. Open the VS Code project/folder you want to generate documentation for.
2. Use the Command Palette (`Ctrl+Shift+P`) and type **Generate Documentation**.
3. The extension will scan your codebase, send the code to the backend (if available), and generate a `documentation.md` file in the root directory of your project.

If the backend is not available, a dummy documentation file will be created instead.



## Configuration

You can customize the backend URL or other settings by modifying the extension's code. If you want to change the backend API endpoint or add more exclusions for file types or directories, you can adjust the configuration in the `extension.ts` file.



## Development

To build and package the extension for publishing to the Visual Studio Marketplace, follow these steps:

1. Run the following command to package your extension into a `.vsix` file:
   ```bash
   vsce package
   ```

2. The `.vsix` file can be shared or published to the VS Code marketplace.

### Running Locally

To test the extension locally, follow these steps:

1. Open the extension in VS Code (`code .`).
2. Press `F5` to launch a new instance of VS Code with the extension loaded.
3. Open any project folder and run the **Generate Documentation** command from the Command Palette.



## Troubleshooting

- **Backend not working**: Ensure that the backend is running locally and is accessible at the specified endpoint (`http://localhost:8000/document`).
- **Error while generating documentation**: If an error occurs while interacting with the backend, a dummy file will be created in your project directory for testing purposes.
- **No workspace is open**: Make sure that you have a project or folder opened in VS Code when generating the documentation.



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## Acknowledgements

- This extension integrates with the **Phi-2 model** for AI-based documentation generation.
- Special thanks to the open-source community for providing valuable tools and libraries that helped make this extension possible.



Feel free to contribute by submitting issues or pull requests. Enjoy documenting your code with **CodeScribe**!