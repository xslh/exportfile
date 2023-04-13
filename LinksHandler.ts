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

	async copyFile(tfile: TFile, newPath: string) {
		const fullPath = normalizePath(newPath + "/" + tfile.path);
		const fullFolder = normalizePath(newPath + (tfile.parent.isRoot() ? "" : "/" + tfile.parent.path));

		if (!await this.app.vault.adapter.exists(fullFolder))
			await this.app.vault.createFolder(fullFolder);
		const havefile = await this.app.vault.adapter.exists(fullPath);
		console.log("havefile", havefile);
		if (!havefile)
			await this.app.vault.copy(tfile, fullPath);
	}

	/** copy一个笔记到目的目录
	 * @param sourceNotePath {string} 笔记的路径
	 * @param destNotePath {string}  笔记的目的路径
	 * @return {TFile} 新创建的笔记的TFile对象
	 */
	async copyNote(sourceNotePath: string, destNotePath: string): Promise<TFile | null> {
		const sourceNote = this.app.metadataCache.getFirstLinkpathDest(sourceNotePath, sourceNotePath);
		const newNotePath = this.generateFileCopyName(destNotePath);
		if (!await this.app.vault.adapter.exists(path.dirname(newNotePath)))
			await this.app.vault.createFolder(path.dirname(newNotePath));
		return sourceNote && await this.app.vault.copy(sourceNote, newNotePath);

	}

}
