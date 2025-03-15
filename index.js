const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const commander = require("commander");

class AndroidProjectManager {
    constructor(projectName = "MyAndroidApp") {
        this.projectName = projectName;
        this.projectPath = path.join(__dirname, this.projectName);
        this.assetsPath = path.join(this.projectPath, "app/src/main/assets");
    }

    runCommand(command, workingDir = this.projectPath) {
        try {
            console.log(`🔹 Executing: ${command}`);
            execSync(command, { stdio: "inherit", cwd: workingDir });
        } catch (error) {
            console.error(`❌ Error executing command: ${command}\n`, error.message);
        }
    }

    createProject() {
        if (!fs.existsSync(this.projectPath)) {
            fs.mkdirSync(this.projectPath, { recursive: true });
        }
        console.log(`🚀 Creating Android project: ${this.projectName}`);
        this.runCommand("gradle init", this.projectPath);
        console.log("✅ Project created successfully!");
    }

    installDependencies() {
        console.log("📦 Installing Android SDK dependencies...");
        this.runCommand("sdkmanager --install 'platforms;android-34' 'build-tools;34.0.0'");
        console.log("✅ Dependencies installed!");
    }

    buildProject() {
        console.log("⚙️  Building the Android project...");
        this.runCommand("./gradlew build");
        console.log("✅ Build completed successfully!");
    }

    runApp() {
        console.log("📱 Running the Android app...");
        this.runCommand("./gradlew installDebug");
        console.log("✅ App installed and running!");
    }

    ensureAssetsFolder() {
        if (!fs.existsSync(this.assetsPath)) {
            fs.mkdirSync(this.assetsPath, { recursive: true });
            console.log("📂 Created assets folder.");
        }
    }

    createIndexHtml() {
        this.ensureAssetsFolder();
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebView Test</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #3498db; }
    </style>
</head>
<body>
    <h1>Welcome to WebView!</h1>
    <p>This page is loaded from the <strong>assets</strong> folder.</p>
</body>
</html>
        `;
        const indexHtmlPath = path.join(this.assetsPath, "index.html");
        fs.writeFileSync(indexHtmlPath, htmlContent, "utf8");
        console.log("✅ Created index.html in assets folder.");
    }

    findMainActivity() {
        const javaSrcPath = path.join(this.projectPath, "app/src/main/java");
        if (!fs.existsSync(javaSrcPath)) return null;

        let mainActivityPath = null;
        function searchFiles(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    searchFiles(fullPath);
                } else if (file === "MainActivity.java") {
                    mainActivityPath = fullPath;
                    return;
                }
            }
        }

        searchFiles(javaSrcPath);
        return mainActivityPath;
    }

    addWebView() {
        const mainActivityPath = this.findMainActivity();
        if (!mainActivityPath) {
            console.error("❌ MainActivity.java not found!");
            return;
        }

        let mainActivityCode = fs.readFileSync(mainActivityPath, "utf8");

        if (mainActivityCode.includes("new WebView(this)")) {
            console.log("✅ WebView already added!");
            return;
        }

        mainActivityCode = mainActivityCode.replace(
            "setContentView(R.layout.activity_main);",
            `WebView webView = new WebView(this);
webView.getSettings().setJavaScriptEnabled(true);
webView.setWebViewClient(new WebViewClient());
webView.loadUrl("file:///android_asset/index.html");
setContentView(webView);`
        );

        if (!mainActivityCode.includes("import android.webkit.WebView;")) {
            mainActivityCode = `${mainActivityCode.replace(
                "import android.os.Bundle;",
                `import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;`
            )}`;
        }

        fs.writeFileSync(mainActivityPath, mainActivityCode, "utf8");
        console.log("✅ WebView added successfully!");
    }
}

// Commander CLI implementation
commander
    .command('create-project')
    .description('Create a new Android project')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.createProject();
    });

commander
    .command('install-deps')
    .description('Install dependencies for the Android project')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.installDependencies();
    });

commander
    .command('build')
    .description('Build the Android project')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.buildProject();
    });

commander
    .command('run-app')
    .description('Run the Android app')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.runApp();
    });

commander
    .command('ensure-assets')
    .description('Ensure assets folder exists')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.ensureAssetsFolder();
    });

commander
    .command('create-index-html')
    .description('Create index.html in the assets folder')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.createIndexHtml();
    });

commander
    .command('add-webview')
    .description('Add WebView to MainActivity')
    .action(() => {
        const manager = new AndroidProjectManager();
        manager.addWebView();
    });

commander.parse(process.argv);