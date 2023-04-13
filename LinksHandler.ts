import { App, getLinkpath, normalizePath, TFile } from 'obsidian';
import { path } from './path';
import { Utils } from './utils';
import { MyPluginSettings } from './main';

export class LinksHandler {



	settings: MyPluginSettings;
	app: App;
	constructor(app: App, settings: MyPluginSettings) {
		this.settings = settings;
		this.app = app;
	}

	generateFileCopyName(originalName: string): string {
		console.log('in genearteFileCopyName');
		if (!this.getFileByPath(originalName)) {
			return Utils.normalizePathForFile(originalName);
		}
		const ext = path.extname(originalName);
		const baseName = path.basename(originalName, ext);
		const dir = path.dirname(originalName);
		for (let i = 1; i < 100000; i++) {
			const newName = dir + "/" + baseName + "_" + i + ext;
			const existFile = this.getFileByPath(newName);
			if (!existFile)
				return newName;
		}
		return "";
	}

	getFileByLink(link: string, owningNotePath: string): TFile | null {
		//link = link.replace(/#.+/, '');
		link = getLinkpath(link);
		return this.app.metadataCache.getFirstLinkpathDest(link, owningNotePath);
	}


	getFileByPath(path: string): TFile | undefined {
		const files = this.app.vault.getFiles();
		const file = files.find(file => file.path === path);
		return file;
	}


	/** 复制一个文件为目的文件，如果文件同名将重命名文件，尾数加1
	 * @param sourceFilePath {string} 文件的源路径
	 * @param destFilePath {string}  文件的目的路径
	 * @return {TFile} 新创建文件的TFile对象
	 * 
	 */
	async copyFile(sourceFilePath: string, destFilePath: string): Promise<TFile | null> {
		const sourceFile = this.app.metadataCache.getFirstLinkpathDest(sourceFilePath, sourceFilePath);
		const newFilePath = this.generateFileCopyName(destFilePath);
		if (!await this.app.vault.adapter.exists(path.dirname(newFilePath)))
			await this.app.vault.createFolder(path.dirname(newFilePath));
		return sourceFile && await this.app.vault.copy(sourceFile, newFilePath);

	}

}
