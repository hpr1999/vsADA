// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readdirSync } from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('ada.run', run));

	context.subscriptions.push(vscode.commands.registerCommand('ada.buildNrun', buildAndRun));

	context.subscriptions.push(vscode.commands.registerCommand('ada.clean', clean));

	context.subscriptions.push(vscode.commands.registerCommand('ada.compile', compile));

	context.subscriptions.push(vscode.commands.registerCommand('ada.changeGNAT', change));
}

function buildAndRun() {
	compile()?.then(() => setTimeout(()=>clean()?.then(() => setTimeout(run,3000)),3000));
	
}

function run() {

	return performOnAdaFile((adaFile: string) => {
		return executeExe(adaFile.slice(0, adaFile.lastIndexOf('.')).toLocaleLowerCase() + '.exe', []);
	});
}

function clean() {
	let gnatClean = getExe("gnatclean");

	return performOnAdaFile((adaFile: string) => {
		return executeExe(gnatClean, ["-c", adaFile]);
	});
}

function compile() {
	let gnatMake = getExe("gnatmake");
	return performOnAdaFile((adaFile: string) => {
		return executeExe(gnatMake, ["-B", adaFile]);
	});
}


function performOnAdaFile(f: (adaFile: string) => Thenable<vscode.TaskExecution> | undefined) {
	let adaFile = vscode.window.activeTextEditor?.document.fileName;

	if (adaFile) {
		return f.call(undefined, adaFile);
	} else {
		vscode.window.showErrorMessage("No active ADA text editor.");
	}
}

function executeExe(exe: string | undefined, options: string[]) {
	if (exe) {
		return executeProcess(new vscode.ProcessExecution(exe, options, undefined));
	} else {
		vscode.window.showErrorMessage("Could not execute command as the executable was not found.");
	}
}

function executeProcess(process: vscode.ProcessExecution) {
	let doc = vscode.window.activeTextEditor?.document;
	if (doc) {
		let workspace = vscode.workspace.getWorkspaceFolder(doc.uri);
		if (workspace) {
			let name = process.process.slice(process.process.lastIndexOf('\\') + 1);
			let task = new vscode.Task({ type: "process" }, workspace, name, "vsada", process);

			let taskExec = vscode.tasks.executeTask(task);
			return taskExec;
		}
	}
}

function change() {
	let filePicker = vscode.window.showOpenDialog({
		canSelectFiles: false,
		canSelectMany: false,
		canSelectFolders: true
	});

	filePicker.then((uri) => {
		if (uri) {
			vscode.workspace.getConfiguration('vsada').update('GNAT-bin-path', uri[0].fsPath, vscode.ConfigurationTarget.Global);
		}
	}, (reason) => console.error(`Config Update rejected. Reason: ${reason}`));
}

function getExe(name: string) {
	let gnat_bin = getGNAT_bin();
	if (gnat_bin) {
		return `${getGNAT_bin()}\\${name}.exe`;
	}
	return undefined;
}

function getGNAT_bin() {
	let result = retrieveGNATbin();

	if (!result || result === "undefined" || !validDir(result)) {
		let errorMessage;

		if (!result || result === "undefined") {
			errorMessage = "GNAT binary location undefined.";
		} else {
			errorMessage = "The directory does not contain gnatmake.exe and gnatclean.exe";
		}

		let reaction = vscode.window.showErrorMessage(errorMessage, "Change GNAT location");
		reaction.then((choice: string | undefined) => { if (choice) { change(); } });
		return undefined;
	} else {
		return result;
	}

	function retrieveGNATbin() {
		return vscode.workspace.getConfiguration('vsada').get('GNAT-bin-path', 'error');
	}

	function validDir(dirPath: string): boolean {
		let dir = readdirSync(dirPath);

		let required = new Set(["gnatmake.exe", "gnatclean.exe"]);

		for (const element of required.values()) {
			if (!dir.includes(element)) {
				return false;
			}
		}

		return true;
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
