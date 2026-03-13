export async function pickJsonFileText(): Promise<string | null> {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.onchange = async (event: Event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) {
				resolve(null);
				return;
			}

			resolve(await file.text());
		};

		input.click();
	});
}
