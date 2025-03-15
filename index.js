const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// class AndroidProjectManager {
//     constructor(projectName = "MyAndroidApp") {
//         this.projectName = projectName;
//         this.projectPath = path.join(__dirname, this.projectName);
//         this.assetsPath = path.join(this.projectPath, "app/src/main/assets");
//         try {
//             execSync('gradle -v', { stdio: 'ignore' });
//         } catch (error) {
//             console.error("❌ Gradle not found! Please install Gradle and ensure it's in your system PATH.");
//             return;
//         }
//     }

//     runCommand(command, workingDir = this.projectPath) {
//         try {
//             console.log(`🔹 Executing: ${command}`);
//             execSync(command, { stdio: "inherit", cwd: workingDir });
//         } catch (error) {
//             console.error(`❌ Error executing command: ${command}\n`, error.message);
//         }
//     }

//     createProject() {
//         if (!fs.existsSync(this.projectPath)) {
//             fs.mkdirSync(this.projectPath, { recursive: true });
//         }
//         console.log(`🚀 Creating Android project: ${this.projectName}`);
//         this.runCommand("gradle init", this.projectPath);
//         console.log("✅ Project created successfully!");
//     }

//     installDependencies() {
//         console.log("📦 Installing Android SDK dependencies...");
//         this.runCommand("sdkmanager --install 'platforms;android-34' 'build-tools;34.0.0'");
//         console.log("✅ Dependencies installed!");
//     }

//     buildProject() {
//         console.log("⚙️  Building the Android project...");
//         this.runCommand("./gradlew build");
//         console.log("✅ Build completed successfully!");
//     }

//     runApp() {
//         console.log("📱 Running the Android app...");
//         this.runCommand("./gradlew installDebug");
//         console.log("✅ App installed and running!");
//     }

//     ensureAssetsFolder() {
//         if (!fs.existsSync(this.assetsPath)) {
//             fs.mkdirSync(this.assetsPath, { recursive: true });
//             console.log("📂 Created assets folder.");
//         }
//     }

//     createIndexHtml() {
//         this.ensureAssetsFolder();
//         const htmlContent = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>WebView Test</title>
//     <style>
//         body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
//         h1 { color: #3498db; }
//     </style>
// </head>
// <body>
//     <h1>Welcome to WebView!</h1>
//     <p>This page is loaded from the <strong>assets</strong> folder.</p>
// </body>
// </html>
//         `;
//         const indexHtmlPath = path.join(this.assetsPath, "index.html");
//         fs.writeFileSync(indexHtmlPath, htmlContent, "utf8");
//         console.log("✅ Created index.html in assets folder.");
//     }

//     findMainActivity() {
//         const javaSrcPath = path.join(this.projectPath, "app/src/main/java");
//         if (!fs.existsSync(javaSrcPath)) return null;

//         let mainActivityPath = null;
//         function searchFiles(dir) {
//             const files = fs.readdirSync(dir);
//             for (const file of files) {
//                 const fullPath = path.join(dir, file);
//                 if (fs.statSync(fullPath).isDirectory()) {
//                     searchFiles(fullPath);
//                 } else if (file === "MainActivity.java") {
//                     mainActivityPath = fullPath;
//                     return;
//                 }
//             }
//         }

//         searchFiles(javaSrcPath);
//         return mainActivityPath;
//     }

//     addWebView() {
//         const mainActivityPath = this.findMainActivity();
//         if (!mainActivityPath) {
//             console.error("❌ MainActivity.java not found!");
//             return;
//         }

//         let mainActivityCode = fs.readFileSync(mainActivityPath, "utf8");

//         if (mainActivityCode.includes("new WebView(this)")) {
//             console.log("✅ WebView already added!");
//             return;
//         }

//         mainActivityCode = mainActivityCode.replace(
//             "setContentView(R.layout.activity_main);",
//             `WebView webView = new WebView(this);
// webView.getSettings().setJavaScriptEnabled(true);
// webView.setWebViewClient(new WebViewClient());
// webView.loadUrl("file:///android_asset/index.html");
// setContentView(webView);`
//         );

//         if (!mainActivityCode.includes("import android.webkit.WebView;")) {
//             mainActivityCode = `${mainActivityCode.replace(
//                 "import android.os.Bundle;",
//                 `import android.os.Bundle;
// import android.webkit.WebView;
// import android.webkit.WebViewClient;`
//             )}`;
//         }

//         fs.writeFileSync(mainActivityPath, mainActivityCode, "utf8");
//         console.log("✅ WebView added successfully!");
//     }
// }


class AndroidProjectManager{
    constructor( projectName = "MyAndroidApp" ){
        this.gradle;
        this.gradlew;
        this.projectName = projectName;
        this.projectPath = path.join(__dirname, this.projectName);
        this.assetsPath = path.join(this.projectPath, "app/src/main/assets");
        this.checkGradleInstalled();
    }
    async checkGradleInstalled(){
        let mainDrive = process.env.HOMEDRIVE;
        let gradle = `${mainDrive}/gradle/bin/gradle.bat`;
        if(!fs.existsSync(gradle)){
            console.error(`Gradle not found! Please install Gradle. https://gradle.org/\r\n Install it on ${mainDrive}\\gradle`);
            process.exit();
        }
        this.gradle = gradle;
    }
    async runCommand(command, workingDir = this.projectPath) {
        try {
            console.log(`🔹 Executing: ${command}`);
            execSync(command, { stdio: "inherit", cwd: workingDir });
        } catch (error) {
            console.error(`❌ Error executing command: ${command}\n`, error.message);
        }
    }
    editStringInFile(file, id, d) {
        // Read the specified file
        let read = fs.readFileSync(`${file}`, 'utf8');
    
        // Check if input types are correct
        if (typeof id === 'string' && typeof read === 'string') {
            // Construct the regex placeholder dynamically
            let regexPlaceholder = `{{${id}}}`;
            let regex = new RegExp(regexPlaceholder, 'g');
            
            // Replace the placeholder with provided content or default to empty string if d is not provided
            let fileContent = read.replace(regex, `${d || ''}`);
            
            return fileContent;
        } else {
            console.error('Invalid input types for id or d.');
            return null;
        }
    }
    createFilesForGradle(){
        let defaultBuildGradle = this.editStringInFile('build.gradle.default', 'aplicationame', this.projectName );
        fs.writeFileSync(`${this.projectPath}/build.gradle`,defaultBuildGradle);
        let defaultBuildGradleSettings = this.editStringInFile('settings.gradle.default', 'aplicationame', this.projectName );
        fs.writeFileSync(`${this.projectPath}/settings.gradle`, defaultBuildGradleSettings);
    }
    createProject() {
        if (!fs.existsSync(this.projectPath)) {
            fs.mkdirSync(this.projectPath, { recursive: true });
        }
        console.log(`🚀 Creating Android project: ${this.projectName}`);
        this.createFilesForGradle();
        this.runCommand(`${this.gradle} init --type basic --project-name ${this.projectName} --dsl groovy --java-version 21 --no-split-project --incubating`, this.projectPath);
        // this.runCommand(`${this.gradle} init --type android-application --package com.${this.projectName} --project-name ${this.projectName} --test-framework junit-jupiter --dsl groovy --java-version 21 --no-split-project --incubating`, this.projectPath);
        console.log("✅ Project created successfully!");
    }
    buildProject() {
        // console.log("⚙️  Building the Android project...");
        // this.runCommand(`./${this.projectName}/gradlew build`);
        // console.log("✅ Build completed successfully!");
    }

    runApp() {
        console.log("📱 Running the Android app...");
        this.runCommand(`./${this.projectName}/gradlew.bat installDebug`);
        console.log("✅ App installed and running!");
    }
    
}
let test = new AndroidProjectManager();
test.createProject();
// test.buildProject()
