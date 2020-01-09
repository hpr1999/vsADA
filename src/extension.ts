// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
	compile();
	clean();
	run();
}

function run() {

	performOnAdaFile((adaFile: string) => {
		executeExe(adaFile.slice(0, adaFile.lastIndexOf('.')).toLocaleLowerCase() + '.exe',[]);
	});
}

function clean() {
	let gnatClean = getExe("gnatclean");
	performOnAdaFile((adaFile: string) => {
		executeExe(gnatClean,["-c",adaFile]);
	});	
}

function compile() {
	let gnatMake = getExe("gnatmake");
	performOnAdaFile((adaFile: string) => {
		executeExe(gnatMake,["-B",adaFile]);
	});	
}


function performOnAdaFile(f: (adaFile: string) => void) {
	let adaFile = vscode.window.activeTextEditor?.document.fileName;

	if (adaFile) {
		f.call(undefined,adaFile);
	} else {
		vscode.window.showErrorMessage("No active ADA text editor.");
	}
}

function executeExe(exe: string, options: string[]) {
	executeProcess(new vscode.ProcessExecution(exe,options,undefined));
}

function executeProcess(process: vscode.ProcessExecution) {
	let doc = vscode.window.activeTextEditor?.document;
	if (doc) {
		let workspace = vscode.workspace.getWorkspaceFolder(doc.uri);
		if (workspace) {
			let name = process.process.slice(process.process.lastIndexOf('\\')+1);
			let task = new vscode.Task({ type: "process"}, workspace, name, "source", process);
			
			vscode.tasks.executeTask(task);
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
	return `${getGNAT_bin()}\\${name}.exe`;
}

function getGNAT_bin() {
	return vscode.workspace.getConfiguration('vsada').get('GNAT-bin-path', 'error');
}

// this method is called when your extension is deactivated
export function deactivate() { }
