import type { Initializable } from "src/domain/Initializable";
import type { Filters } from "src/domain/models/common/Filters";
import type { WithUrl } from "src/domain/models/common/WithUrl";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DB from "src/data/databse/DB";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import type { Editor } from "obsidian";

export abstract class BaseFeature<
    ST extends WithUrl,
    FT extends ST,
    F extends Filters,
> implements Initializable {

    public repository: Repository<ST, FT, F>;
    public sidePanel: BaseSidePanel<ST, FT, F>;
    public codeBlockProcessor: BaseMdCodeBlockProcessor<ST, FT, F>;

    constructor(
        private plugin: DndStatblockPlugin,
        private database: DB,
        private uiEventListener: IUiEventListener,
    ) {
        this.repository = this.createRepository(database);
        this.sidePanel = this.createSidePanel(plugin, this.repository, uiEventListener);
        this.codeBlockProcessor = this.createCodeBlockProcessor();
    }

    abstract createRepository(
        database: DB,
    ): Repository<ST, FT, F>;

    abstract createSidePanel(
        plugin: DndStatblockPlugin,
        repository: Repository<ST, FT, F>,
        uiEventListener: IUiEventListener,
    ): BaseSidePanel<ST, FT, F>;

    abstract createCodeBlockProcessor(): BaseMdCodeBlockProcessor<ST, FT, F>;

    getCommands(): FeatureCommand[] { return []; }

    async initialize(): Promise<void> {
        this.repository.initialize();
        this.sidePanel.register();
        this.codeBlockProcessor.register(this.plugin, this.repository, this.uiEventListener);
        this.getCommands().forEach(command => {
            this.plugin.addCommand({
                id: command.id,
                name: command.name,
                editorCallback: command.editorCallback,
            });
        });
    }

    async dispose(): Promise<void> {
        this.repository.dispose();
    }

    async onItemClick(url: string): Promise<void> {
        const fullItem = await this.repository.getFullItemByUrl(url);
        if (fullItem) await this.sidePanel.open(fullItem);
    }
}

export interface FeatureCommand {
    id: string;
    name: string;
    editorCallback: (editor: Editor) => void;
}
