# 📄 Serverless LaTeX Editor

A modern, fast, and fully serverless LaTeX editor built with Next.js, React, and Monaco Editor. Compile LaTeX directly from your browser, preview the generated PDF in real-time, and download it instantly—no local LaTeX installation required!

![UI Preview](https://img.shields.io/badge/UI-Glassmorphic-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Next.js](https://img.shields.io/badge/Built_with-Next.js-black)

## ✨ Features

- **🚀 Fully Serverless:** Works entirely in your browser using a cloud LaTeX compiler API.
- **⚡ Real-time Preview:** Auto-compiles your LaTeX code into a PDF after a short delay, displaying it directly on the screen.
- **🎨 Modern Dark/Light Mode:** Beautiful, responsive UI built with Tailwind CSS.
- **📝 Pre-built Templates:** Instantly start writing with built-in templates for Professional Resumes, IEEE Academic Papers, and Cover Letters.
- **💾 Local Storage Auto-Save:** Your code is automatically saved to your browser so you never lose your progress!
- **⬇️ Easy Export:** Download your compiled PDF with a single click.
- **💻 Monaco Editor:** Industry-standard code editing experience (the same engine powering VS Code), complete with syntax highlighting.

## 🚀 How to Use Online

Since this editor is fully static and serverless, you don't need to install anything! 
*(If you are viewing the hosted version on GitHub Pages, just open the link and start typing!)*

1. **Select a Template:** Use the dropdown in the top right to select a starting point (e.g., Resume, IEEE Paper).
2. **Write LaTeX:** Type your LaTeX code in the left panel.
3. **Wait for Auto-Compile:** Stop typing for 2 seconds, and the editor will automatically compile your code. You can also click the green **Compile** button to force a manual compile.
4. **Preview:** The right pane will display your generated PDF. If there are syntax errors in your LaTeX code, a red alert box will display the compiler logs so you can fix the issue.
5. **Download:** Once your PDF is generated, click the blue **PDF** button to open the final document and save it to your computer.

## 🛠️ Local Development

If you want to run this project locally on your machine or fork it to make changes:

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/latex-editor.git
   cd latex-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:** Navigate to `http://localhost:3000` to view the app!

## 🌐 Deploying to GitHub Pages

This project is configured to be exported as a 100% static site (`output: "export"` in `next.config.ts`), making it incredibly easy to host on GitHub Pages.

1. Upload the files in this folder to your GitHub repository.
2. Go to your repository **Settings** > **Pages**.
3. Under **Build and deployment**, change the **Source** to **GitHub Actions**.
4. GitHub will suggest the **Next.js** workflow. Click **Configure** and then commit the workflow file.
5. GitHub will automatically build your app and give you a live URL to share with the world!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the MIT License.
