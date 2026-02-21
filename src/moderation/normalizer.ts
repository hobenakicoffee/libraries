export function normalizeLeetspeak(text: string): string {
	const map: Record<string, string> = {
		"0": "o",
		"1": "i",
		"3": "e",
		"4": "a",
		"5": "s",
		"7": "t",
		"@": "a",
		$: "s",
	};

	return text
		.split("")
		.map((c) => map[c] ?? c)
		.join("");
}

export function normalizeUnicode(text: string): string {
	return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function compact(text: string): string {
	return text.replace(/[\s\W_]+/g, "");
}
