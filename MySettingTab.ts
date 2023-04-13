import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from './main';

export class MySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: '笔记归集插件设置' });

		new Setting(containerEl)
			.setName('笔记归集目录')
			.setDesc('用于将笔记文件放在指定目录，方便归集笔记的附件，方便导出')
			.addText(text => text
				.setPlaceholder('目录名称')
				.setValue(this.plugin.settings.collectionPath)
				.onChange(async (value) => {
					console.log('归集目录: ' + value);
					this.plugin.settings.collectionPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
