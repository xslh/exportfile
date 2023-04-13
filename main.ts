import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
//import * as path from 'path';
//import { Utils } from 'utils';
import { LinksHandler } from './LinksHandler';
import { MySettingTab } from './MySettingTab';
import { path } from './path';

// Remember to rename these classes and interfaces!

export interface MyPluginSettings {
	collectionPath: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	collectionPath: '归集目录'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	lh: LinksHandler;
	async onload() {
		await this.loadSettings();
		this.lh = new LinksHandler(this.app, this.settings);
		this.addSettingTab(new MySettingTab(this.app, this));

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'get-exportfile',
			name: '归集当前笔记',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const currentfile: string = <string>this.app.workspace.getActiveFile()?.path
				//new Notice(this.app.workspace.getActiveFile()?.path.toString());
				console.log("currentfile:", this.app.metadataCache.resolvedLinks[currentfile]);

				await this.collectNote(currentfile);
			}
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async collectNote(sourceNotePath: string) {
		if (path.extname(sourceNotePath) == "md") {
			new Notice("请指定一个markdown笔记文件名！", 10);
			return
		}
		const targedNotePath = this.settings.collectionPath + "/" + path.basename(sourceNotePath);
		console.log("targedNotePath", targedNotePath,);
		const newNotePath = this.lh.generateFileCopyName(targedNotePath);
		console.log('newNotePath:', newNotePath);
		await this.lh.copyNote(sourceNotePath, newNotePath);



	}
}

