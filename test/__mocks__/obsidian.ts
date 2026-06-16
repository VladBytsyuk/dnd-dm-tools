import { parse, stringify } from 'yaml';

export class Component {
  onload() {}
  onunload() {}
}

export class MarkdownRenderChild extends Component {
  constructor(public containerEl: HTMLElement) {
    super();
  }
}

export type MarkdownPostProcessorContext = {
  addChild: (child: MarkdownRenderChild) => void;
};

export class TFile {
  constructor(
    public path: string,
    public basename = path.split('/').pop()?.replace(/\.\w+$/, '') ?? 'file',
    public extension = (path.split('.').pop() ?? 'md')
  ) {}
}

export class App {
  vault = {
    read: async (_file: TFile) => '',
    getAbstractFileByPath: (_p: string) => null,
  };
  workspace = {
    getActiveFile: () => null as TFile | null,
    onLayoutReady: (cb: () => void) => cb(),
  };
  metadataCache = {};
}

export type Command = { id: string; name: string; callback?: () => void };

export class Plugin {
  constructor(public app: App/*, public manifest?: any*/) {}
  commands: Command[] = [];
  markdownPostProcessors: Function[] = [];
  domEvents: Array<{ el: EventTarget; type: string; callback: EventListener; options?: boolean | AddEventListenerOptions }> = [];
  editorExtensions: unknown[] = [];
  addCommand(cmd: Command) { this.commands.push(cmd); return cmd; }
  registerMarkdownPostProcessor(postProcessor: Function) {
    this.markdownPostProcessors.push(postProcessor);
    return postProcessor;
  }
  registerDomEvent(
    el: EventTarget,
    type: string,
    callback: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    this.domEvents.push({ el, type, callback, options });
    el.addEventListener(type, callback, options);
  }
  registerEditorExtension(extension: unknown) {
    this.editorExtensions.push(extension);
  }
  async onload() {}
  async onunload() {}
}

export class PluginManifest {
  constructor() {}
}

export class Notice {
  constructor(public message: string, public timeout?: number) {}
}

export function normalizePath(p: string) { return p.replace(/\\/g, '/'); }
export function setIcon(parent: HTMLElement, iconId: string) {
  parent.dataset.icon = iconId;
}
export async function requestUrl(_opts: any) {
  return { status: 200, text: async () => '', json: async () => ({}) };
}

export function stringifyYaml(obj: any): string {
  return stringify(obj);
}

export function parseYaml(yaml: string): any {
  return parse(yaml);
}
