// Rich text editor content node
export interface EditorNode {
	type: string;
	text?: string;
	content?: EditorNode[];
}

// Rich text editor content structure
export interface EditorContent {
	type: string;
	content?: EditorNode[];
}

// Editor state with ID
export interface EditorState {
	id: string;
	data: EditorContent;
}

// Text field with editor state
export interface TextField {
	value: EditorState;
	isHidden?: boolean;
}

// All character text sections
export interface CharacterTextSections {
	attacks: TextField;
	traits: TextField;
	features: TextField;
	feats: TextField;
	equipment: TextField;
	items: TextField;
	appearance: TextField;
	background: TextField;
	allies: TextField;
	personality: TextField;
	ideals: TextField;
	bonds: TextField;
	flaws: TextField;
	quests: TextField;
	"notes-1": TextField;
	"notes-2": TextField;
	"notes-3": TextField;
	"notes-4": TextField;
	"notes-5": TextField;
	"notes-6": TextField;
	prof: TextField;
}
