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
  addCommand(cmd: Command) { this.commands.push(cmd); return cmd; }
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
export async function requestUrl(_opts: any) {
  return { status: 200, text: async () => '', json: async () => ({}) };
}
