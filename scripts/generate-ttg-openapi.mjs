import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const ttgRoot = process.env.TTG_CORE_API_PATH ?? "/tmp/ttg-core-api";
const javaRoot = path.join(ttgRoot, "src/main/java");
const outputPath = path.join(repoRoot, "docs/ttg-openapi.json");

const PRIMITIVE_SCHEMAS = new Map([
	["String", { type: "string" }],
	["char", { type: "string" }],
	["Character", { type: "string" }],
	["UUID", { type: "string", format: "uuid" }],
	["LocalDate", { type: "string", format: "date" }],
	["LocalDateTime", { type: "string", format: "date-time" }],
	["java.time.LocalDate", { type: "string", format: "date" }],
	["java.time.LocalDateTime", { type: "string", format: "date-time" }],
	["java.time.OffsetDateTime", { type: "string", format: "date-time" }],
	["java.time.Instant", { type: "string", format: "date-time" }],
	["OffsetDateTime", { type: "string", format: "date-time" }],
	["Instant", { type: "string", format: "date-time" }],
	["Date", { type: "string", format: "date-time" }],
	["java.util.Date", { type: "string", format: "date-time" }],
	["Boolean", { type: "boolean" }],
	["boolean", { type: "boolean" }],
	["Integer", { type: "integer", format: "int32" }],
	["int", { type: "integer", format: "int32" }],
	["Long", { type: "integer", format: "int64" }],
	["long", { type: "integer", format: "int64" }],
	["Short", { type: "integer", format: "int32" }],
	["short", { type: "integer", format: "int32" }],
	["Byte", { type: "integer", format: "int32" }],
	["byte", { type: "integer", format: "int32" }],
	["Double", { type: "number", format: "double" }],
	["double", { type: "number", format: "double" }],
	["Float", { type: "number", format: "float" }],
	["float", { type: "number", format: "float" }],
	["BigDecimal", { type: "number" }],
	["BigInteger", { type: "integer" }],
	["Object", { type: "object", additionalProperties: true }],
	["JsonNode", { type: "object", additionalProperties: true }],
	["Void", { type: "null" }],
	["MultipartFile", { type: "string", format: "binary" }],
]);

const HTTP_MAPPING_ANNOTATIONS = new Map([
	["GetMapping", "get"],
	["PostMapping", "post"],
	["PutMapping", "put"],
	["DeleteMapping", "delete"],
	["PatchMapping", "patch"],
]);

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const filePath = path.join(dir, entry.name);
		if (entry.isDirectory()) return walk(filePath);
		return entry.isFile() && entry.name.endsWith(".java") ? [filePath] : [];
	});
}

function read(filePath) {
	return fs.readFileSync(filePath, "utf8");
}

function packageName(source) {
	return source.match(/package\s+([A-Za-z0-9_.]+)\s*;/)?.[1] ?? "";
}

function className(source) {
	return source.match(/\bpublic\s+(?:static\s+)?(?:abstract\s+)?(?:class|record|enum|interface)\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1];
}

function imports(source) {
	const result = new Map();
	for (const match of source.matchAll(/^import\s+(?:static\s+)?([A-Za-z0-9_.*]+);/gm)) {
		if (!match[1].endsWith(".*")) {
			result.set(match[1].split(".").pop(), match[1]);
		}
	}
	return result;
}

function annotationArgs(block, name) {
	const index = block.indexOf(`@${name}`);
	if (index < 0) return null;
	let cursor = index + name.length + 1;
	while (/\s/.test(block[cursor] ?? "")) cursor++;
	if (block[cursor] !== "(") return "";

	let depth = 0;
	const start = cursor + 1;
	for (let i = cursor; i < block.length; i++) {
		if (block[i] === "(") depth++;
		if (block[i] === ")") {
			depth--;
			if (depth === 0) return block.slice(start, i);
		}
	}
	return "";
}

function firstString(args) {
	return args?.match(/"([^"]*)"/)?.[1] ?? "";
}

function annotationString(args, propertyName) {
	if (!args) return undefined;
	const pattern = new RegExp(`${propertyName}\\s*=\\s*"([^"]*)"`);
	return args.match(pattern)?.[1];
}

function normalizePath(routePath) {
	if (!routePath) return "";
	const cleaned = routePath.trim().replace(/^['"]|['"]$/g, "");
	if (!cleaned || cleaned === "/") return "";
	return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

function joinPath(base, child) {
	const joined = [base, child]
		.map((part) => (part || "").replace(/^\/+|\/+$/g, ""))
		.filter(Boolean)
		.join("/");
	return `/${joined}`.replace(/\/+/g, "/");
}

function requestMappingMethods(args) {
	const methods = [...(args ?? "").matchAll(/RequestMethod\.([A-Z]+)/g)].map((match) => match[1].toLowerCase());
	return methods.length > 0 ? methods : ["get"];
}

function cleanComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\/\/.*$/gm, "");
}

function splitTopLevel(value, separator = ",") {
	const result = [];
	let current = "";
	let angleDepth = 0;
	let parenDepth = 0;
	let braceDepth = 0;
	let quote = false;
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		const prev = value[i - 1];
		if (char === "\"" && prev !== "\\") quote = !quote;
		if (!quote) {
			if (char === "<") angleDepth++;
			if (char === ">") angleDepth--;
			if (char === "(") parenDepth++;
			if (char === ")") parenDepth--;
			if (char === "{") braceDepth++;
			if (char === "}") braceDepth--;
			if (char === separator && angleDepth === 0 && parenDepth === 0 && braceDepth === 0) {
				result.push(current.trim());
				current = "";
				continue;
			}
		}
		current += char;
	}
	if (current.trim()) result.push(current.trim());
	return result;
}

function stripAnnotations(value) {
	let result = "";
	let i = 0;
	while (i < value.length) {
		if (value[i] !== "@") {
			result += value[i++];
			continue;
		}
		i++;
		while (/[A-Za-z0-9_.]/.test(value[i] ?? "")) i++;
		while (/\s/.test(value[i] ?? "")) i++;
		if (value[i] === "(") {
			let depth = 1;
			i++;
			while (i < value.length && depth > 0) {
				if (value[i] === "(") depth++;
				if (value[i] === ")") depth--;
				i++;
			}
		}
		result += " ";
	}
	return result.replace(/\s+/g, " ").trim();
}

function stripGenerics(typeName) {
	return typeName.replace(/<.*>$/, "").replace(/\[\]$/, "").trim();
}

function genericArgs(typeName) {
	const start = typeName.indexOf("<");
	const end = typeName.lastIndexOf(">");
	if (start < 0 || end < start) return [];
	return splitTopLevel(typeName.slice(start + 1, end));
}

function schemaNameFromFqn(fqn) {
	return fqn.split(".").pop().replace(/[^A-Za-z0-9_]/g, "");
}

function lowerFirst(value) {
	return value ? value[0].toLowerCase() + value.slice(1) : value;
}

function typeFromDeclaration(declaration) {
	return declaration
		.replace(/\b(private|protected|public|final|static|transient|volatile)\b/g, "")
		.trim()
		.replace(/\s+[A-Za-z_][A-Za-z0-9_]*\s*(=.*)?;$/, "")
		.trim();
}

function fieldNameFromDeclaration(declaration) {
	const match = declaration.trim().match(/([A-Za-z_][A-Za-z0-9_]*)\s*(=.*)?;$/);
	return match?.[1];
}

function getClassBody(source, kind) {
	const declaration = source.match(new RegExp(`public\\s+(?:static\\s+)?(?:abstract\\s+)?${kind}\\s+[A-Za-z_][A-Za-z0-9_]*(?:\\s+extends\\s+[A-Za-z0-9_<>., ?]+)?[^{]*\\{`));
	if (!declaration) return "";
	const start = declaration.index + declaration[0].length;
	let depth = 1;
	for (let i = start; i < source.length; i++) {
		if (source[i] === "{") depth++;
		if (source[i] === "}") {
			depth--;
			if (depth === 0) return source.slice(start, i);
		}
	}
	return "";
}

function recordComponents(source, name) {
	const index = source.search(new RegExp(`public\\s+record\\s+${name}\\s*\\(`));
	if (index < 0) return [];
	const start = source.indexOf("(", index) + 1;
	let depth = 1;
	for (let i = start; i < source.length; i++) {
		if (source[i] === "(") depth++;
		if (source[i] === ")") {
			depth--;
			if (depth === 0) return splitTopLevel(source.slice(start, i));
		}
	}
	return [];
}

function parseAnnotations(block) {
	return {
		ignored: /@JsonIgnore\b/.test(block),
		required: /@(NotNull|NotBlank|NotEmpty)\b/.test(block) || /requiredMode\s*=\s*Schema\.RequiredMode\.REQUIRED/.test(block),
		jsonProperty: firstString(annotationArgs(block, "JsonProperty")) || undefined,
		markupContent: /MarkupDescriptionSerializer|FormattedMarkupDescriptionSerializer/.test(block),
		description: annotationString(annotationArgs(block, "Schema"), "description"),
		example: annotationString(annotationArgs(block, "Schema"), "example"),
		min: annotationArgs(block, "Min") ? Number(firstString(annotationArgs(block, "Min")) || annotationArgs(block, "Min")) : undefined,
		max: annotationArgs(block, "Max") ? Number(firstString(annotationArgs(block, "Max")) || annotationArgs(block, "Max")) : undefined,
		sizeMin: annotationArgs(block, "Size")?.match(/min\s*=\s*(\d+)/)?.[1],
		sizeMax: annotationArgs(block, "Size")?.match(/max\s*=\s*(\d+)/)?.[1],
	};
}

function applyAnnotationSchema(schema, annotations) {
	const result = { ...schema };
	if (annotations.description) result.description = annotations.description;
	if (annotations.example) result.example = annotations.example;
	if (Number.isFinite(annotations.min)) result.minimum = annotations.min;
	if (Number.isFinite(annotations.max)) result.maximum = annotations.max;
	if (annotations.sizeMin && result.type === "string") result.minLength = Number(annotations.sizeMin);
	if (annotations.sizeMax && result.type === "string") result.maxLength = Number(annotations.sizeMax);
	if (annotations.sizeMin && result.type === "array") result.minItems = Number(annotations.sizeMin);
	if (annotations.sizeMax && result.type === "array") result.maxItems = Number(annotations.sizeMax);
	return result;
}

const javaFiles = walk(javaRoot);
const typeIndex = new Map();
const sourceByFqn = new Map();

for (const filePath of javaFiles) {
	const source = read(filePath);
	const name = className(source);
	if (!name) continue;
	const fqn = `${packageName(source)}.${name}`;
	typeIndex.set(name, fqn);
	sourceByFqn.set(fqn, { filePath, source, packageName: packageName(source), imports: imports(source), name });
}

function resolveFqn(simpleOrQualified, context) {
	const raw = stripGenerics(simpleOrQualified).replace(/\.\.\./g, "").trim();
	if (!raw || PRIMITIVE_SCHEMAS.has(raw)) return raw;
	if (raw.includes(".")) {
		const [outer, ...inner] = raw.split(".");
		const outerFqn = context?.imports.get(outer) ?? typeIndex.get(outer);
		if (outerFqn && inner.length > 0) return `${outerFqn}.${inner.join(".")}`;
		return raw;
	}
	if (context?.imports.has(raw)) return context.imports.get(raw);
	if (sourceByFqn.has(`${context?.packageName}.${raw}`)) return `${context.packageName}.${raw}`;
	return typeIndex.get(raw) ?? raw;
}

function enumSchema(fqn) {
	const source = sourceByFqn.get(fqn)?.source;
	if (!source) return undefined;
	const body = getClassBody(source, "enum");
	const beforeSemicolon = body.split(";")[0] ?? "";
	const values = splitTopLevel(beforeSemicolon)
		.map((entry) => entry.trim().match(/^([A-Z0-9_]+)/)?.[1])
		.filter(Boolean);
	return values.length > 0 ? { type: "string", enum: values } : { type: "string" };
}

const generatedSchemas = new Map();
const generating = new Set();

function extractTypeSource(source, kind, name) {
	const index = source.search(new RegExp(`public\\s+(?:static\\s+)?(?:abstract\\s+)?${kind}\\s+${name}\\b`));
	if (index < 0) return "";
	const brace = source.indexOf("{", index);
	const semicolon = source.indexOf(";", index);
	if (kind === "record" && (brace < 0 || (semicolon >= 0 && semicolon < brace))) {
		return source.slice(index, semicolon + 1);
	}
	if (brace < 0) return "";
	let depth = 1;
	for (let i = brace + 1; i < source.length; i++) {
		if (source[i] === "{") depth++;
		if (source[i] === "}") {
			depth--;
			if (depth === 0) return source.slice(index, i + 1);
		}
	}
	return "";
}

function stripNestedClassBodies(body) {
	let result = "";
	let i = 0;
	while (i < body.length) {
		const nested = body.slice(i).search(/\bpublic\s+static\s+class\s+[A-Za-z_][A-Za-z0-9_]*/);
		if (nested < 0) {
			result += body.slice(i);
			break;
		}
		const start = i + nested;
		result += body.slice(i, start);
		const brace = body.indexOf("{", start);
		if (brace < 0) break;
		let depth = 1;
		let end = brace + 1;
		for (; end < body.length; end++) {
			if (body[end] === "{") depth++;
			if (body[end] === "}") {
				depth--;
				if (depth === 0) {
					end++;
					break;
				}
			}
		}
		i = end;
	}
	return result;
}

for (const [outerFqn, entry] of [...sourceByFqn.entries()]) {
	for (const match of entry.source.matchAll(/\bpublic\s+(?:static\s+)?(class|record)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
		const kind = match[1];
		const actualName = match[2];
		if (actualName === entry.name) continue;
		const innerSource = extractTypeSource(entry.source, kind, actualName);
		if (!innerSource) continue;
		const innerFqn = `${outerFqn}.${actualName}`;
		typeIndex.set(actualName, innerFqn);
		sourceByFqn.set(innerFqn, {
			filePath: entry.filePath,
			source: innerSource,
			packageName: entry.packageName,
			imports: entry.imports,
			name: actualName,
		});
	}
}

function schemaForType(typeName, context) {
	let type = stripAnnotations(typeName)
		.replace(/\bfinal\b/g, "")
		.replace(/\?/g, "")
		.trim();
	if (!type) return { type: "object", additionalProperties: true };
	if (type.endsWith("[]")) {
		return { type: "array", items: schemaForType(type.slice(0, -2), context) };
	}

	const raw = stripGenerics(type);
	if (PRIMITIVE_SCHEMAS.has(raw)) return { ...PRIMITIVE_SCHEMAS.get(raw) };
	if (["List", "Set", "Collection", "Iterable"].includes(raw)) {
		return { type: "array", items: schemaForType(genericArgs(type)[0] ?? "Object", context) };
	}
	if (["Map", "HashMap", "LinkedHashMap"].includes(raw)) {
		return { type: "object", additionalProperties: schemaForType(genericArgs(type)[1] ?? "Object", context) };
	}
	if (raw === "MultiValueMap") {
		return { type: "object", additionalProperties: { type: "array", items: schemaForType(genericArgs(type)[1] ?? "String", context) } };
	}
	if (raw === "ResponseEntity") return schemaForType(genericArgs(type)[0] ?? "Object", context);

	const fqn = resolveFqn(raw, context);
	if (PRIMITIVE_SCHEMAS.has(fqn)) return { ...PRIMITIVE_SCHEMAS.get(fqn) };
	if (sourceByFqn.has(fqn)) {
		const source = sourceByFqn.get(fqn).source;
		if (/\bpublic\s+enum\s+/.test(source)) return enumSchema(fqn);
		const name = ensureSchema(fqn);
		return { $ref: `#/components/schemas/${name}` };
	}
	return { type: "object", additionalProperties: true, description: `Unresolved Java type ${raw}.` };
}

function ensureSchema(fqn) {
	const schemaName = schemaNameFromFqn(fqn);
	if (generatedSchemas.has(schemaName)) return schemaName;
	if (generating.has(fqn)) {
		generatedSchemas.set(schemaName, { type: "object", additionalProperties: true });
		return schemaName;
	}

	const entry = sourceByFqn.get(fqn);
	if (!entry) return schemaName;
	generating.add(fqn);
	const source = cleanComments(entry.source);
	let schema;
	if (/\bpublic\s+record\s+/.test(source)) {
		schema = schemaFromRecord(entry, source);
	} else if (/\bpublic\s+enum\s+/.test(source)) {
		schema = enumSchema(fqn);
	} else {
		schema = schemaFromClass(entry, source);
	}
	generatedSchemas.set(schemaName, schema);
	generating.delete(fqn);
	return schemaName;
}

function schemaFromRecord(entry, source) {
	const properties = {};
	const required = [];
	for (const component of recordComponents(source, entry.name)) {
		const annotations = parseAnnotations(component);
		if (annotations.ignored) continue;
		const cleaned = stripAnnotations(component);
		const match = cleaned.match(/^(.+?)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
		if (!match) continue;
		const name = annotations.jsonProperty ?? match[2];
		const schema = annotations.markupContent ? { $ref: "#/components/schemas/MarkupContent" } : schemaForType(match[1], entry);
		properties[name] = applyAnnotationSchema(schema, annotations);
		if (annotations.required) required.push(name);
	}
	return {
		type: "object",
		properties,
		...(required.length > 0 ? { required } : {}),
		additionalProperties: false,
	};
}

function superclass(source) {
	return source.match(/\bpublic\s+(?:static\s+)?(?:abstract\s+)?class\s+[A-Za-z_][A-Za-z0-9_]*(?:<[^>]+>)?\s+extends\s+([A-Za-z0-9_<>., ?]+)/)?.[1]?.trim();
}

function schemaFromClass(entry, source) {
	const properties = {};
	const required = [];
	const body = stripNestedClassBodies(getClassBody(source, "class"));
	const lines = body.split(/\r?\n/);
	let annotationsBlock = "";

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;
		if (line.startsWith("@")) {
			annotationsBlock += `${line}\n`;
			continue;
		}
		if (!line.endsWith(";") || !/\b(private|protected|public)\b/.test(line)) {
			annotationsBlock = "";
			continue;
		}
		const annotations = parseAnnotations(annotationsBlock);
		annotationsBlock = "";
		if (annotations.ignored || /\bstatic\b/.test(line)) continue;
		const fieldName = fieldNameFromDeclaration(line);
		if (!fieldName) continue;
		const jsonName = annotations.jsonProperty ?? fieldName;
		const fieldType = typeFromDeclaration(line);
		const schema = annotations.markupContent ? { $ref: "#/components/schemas/MarkupContent" } : schemaForType(fieldType, entry);
		properties[jsonName] = applyAnnotationSchema(schema, annotations);
		if (annotations.required) required.push(jsonName);
	}

	const parent = superclass(source);
	const parentFqn = parent ? resolveFqn(parent, entry) : undefined;
	if (parentFqn && sourceByFqn.has(parentFqn)) {
		const parentName = ensureSchema(parentFqn);
		return {
			allOf: [
				{ $ref: `#/components/schemas/${parentName}` },
				{
					type: "object",
					properties,
					...(required.length > 0 ? { required } : {}),
					additionalProperties: false,
				},
			],
		};
	}
	return {
		type: "object",
		properties,
		...(required.length > 0 ? { required } : {}),
		additionalProperties: false,
	};
}

function classBase(source) {
	const classIndex = source.search(/public\s+class\s+/);
	const before = classIndex >= 0 ? source.slice(0, classIndex) : source;
	return normalizePath(firstString(annotationArgs(before, "RequestMapping")));
}

function tagName(source, fallback) {
	return annotationString(annotationArgs(source, "Tag"), "name") ?? fallback;
}

function operationSummary(block, fallback) {
	return annotationString(annotationArgs(block, "Operation"), "summary") ?? fallback;
}

function mappingPath(args) {
	return normalizePath(firstString(args));
}

function hasSecured(block) {
	return /@(Secured|PreAuthorize|RolesAllowed)\b/.test(block);
}

function methodName(signature) {
	return signature.match(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1] ?? "operation";
}

function returnType(signature) {
	const beforeParen = signature.slice(0, signature.indexOf("(")).replace(/\s+/g, " ").trim();
	const match = beforeParen.match(/^public\s+(.+)\s+[A-Za-z_][A-Za-z0-9_]*$/);
	return match?.[1]?.trim() ?? "Object";
}

function parameterParts(param) {
	const cleaned = stripAnnotations(param).replace(/\bfinal\b/g, "").trim();
	const name = cleaned.match(/([A-Za-z_][A-Za-z0-9_]*)$/)?.[1];
	if (!name) return { name: undefined, type: undefined };
	return {
		name,
		type: cleaned.slice(0, -name.length).trim(),
	};
}

function splitParams(signature) {
	const start = signature.indexOf("(");
	const end = signature.lastIndexOf(")");
	if (start < 0 || end < start) return [];
	return splitTopLevel(signature.slice(start + 1, end));
}

function pathParameters(routePath) {
	return [...routePath.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function queryParameters(signature) {
	const parameters = [];
	for (const param of splitParams(signature)) {
		if (!param.includes("@RequestParam")) continue;
		const args = annotationArgs(param, "RequestParam");
		let name = annotationString(args, "name") ?? annotationString(args, "value");
		const parts = parameterParts(param);
		if (!name) {
			name = parts.name;
		}
		const type = parts.type ?? "String";
		parameters.push({ name, schema: schemaForType(type, undefined) });
	}
	if (/@ParameterObject|@ModelAttribute/.test(signature)) {
		parameters.push({
			name: "q",
			schema: { type: "string" },
			description: "Search/filter query parameters from the controller query DTO.",
		});
	}
	return parameters;
}

function bodyType(signature) {
	const param = splitParams(signature).find((value) => /@(RequestBody|RequestPart)\b/.test(value));
	if (!param) return undefined;
	return parameterParts(param).type;
}

function tagFromPath(routePath, fallback) {
	return fallback ?? routePath.match(/^\/api\/(?:v2\/)?([^/]+)/)?.[1] ?? "TTG Club";
}

function sourceFor(routePath) {
	return routePath.startsWith("/api/v2/") ? "core-api-open-source" : "core-api-open-source-non-v2";
}

function operationId(method, routePath) {
	return `${method}_${routePath.replace(/^\//, "").replace(/[^A-Za-z0-9]+/g, "_")}`.replace(/_$/, "");
}

function addJsonResponse(operation, status, schema) {
	operation.responses[status] = {
		description: status === "201" ? "Created" : status === "204" ? "No content" : "Successful response",
		...(schema ? { content: { "application/json": { schema } } } : {}),
	};
}

function generateControllerPaths() {
	const controllers = javaFiles.filter((filePath) => read(filePath).includes("@RestController"));
	const paths = {};
	const tags = new Map();

	for (const filePath of controllers) {
		const source = read(filePath);
		const base = classBase(source);
		if (!base) continue;
		const fallbackTag = path.basename(filePath, ".java").replace(/Controller$/, "");
		const tag = tagName(source, fallbackTag);
		tags.set(tag, { name: tag });

		const lines = source.split(/\r?\n/);
		let pendingAnnotations = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (/^\s*@/.test(line)) {
				pendingAnnotations.push(line.trim());
				while (
					(pendingAnnotations.join("\n").match(/\(/g) ?? []).length >
						(pendingAnnotations.join("\n").match(/\)/g) ?? []).length &&
					i + 1 < lines.length
				) {
					i++;
					pendingAnnotations.push(lines[i].trim());
				}
				continue;
			}
			if (line.includes(" class ")) {
				pendingAnnotations = [];
				continue;
			}
			if (!/\bpublic\b/.test(line) || !line.includes("(") || line.includes(" class ")) continue;
			let signature = line.trim();
			while (!signature.includes("{") && i + 1 < lines.length) {
				i++;
				signature += ` ${lines[i].trim()}`;
			}
			signature = signature.replace(/\s*\{[\s\S]*$/, "").trim();
			const block = pendingAnnotations.join("\n");
			pendingAnnotations = [];
			const mappings = [];
			for (const [annotation, method] of HTTP_MAPPING_ANNOTATIONS) {
				const args = annotationArgs(block, annotation);
				if (args !== null) mappings.push({ method, child: mappingPath(args) });
			}
			const requestArgs = annotationArgs(block, "RequestMapping");
			if (requestArgs !== null) {
				for (const method of requestMappingMethods(requestArgs)) {
					mappings.push({ method, child: mappingPath(requestArgs) });
				}
			}
			if (mappings.length === 0) continue;

			const controllerContext = sourceByFqn.get(`${packageName(source)}.${className(source)}`);
			for (const mapping of mappings) {
				const routePath = joinPath(base, mapping.child);
				const op = {
					tags: [tagFromPath(routePath, tag)],
					summary: operationSummary(block, methodName(signature)),
					operationId: operationId(mapping.method, routePath),
					"x-source": sourceFor(routePath),
					parameters: [],
					responses: {},
				};
				for (const name of pathParameters(routePath)) {
					op.parameters.push({ name, in: "path", required: true, schema: { type: "string" } });
				}
				for (const param of queryParameters(signature)) {
					op.parameters.push({ name: param.name, in: "query", required: false, schema: param.schema, ...(param.description ? { description: param.description } : {}) });
				}

				const body = bodyType(signature);
				const multipart = /@RequestPart\b|MultipartFile\b/.test(signature);
				if (body || multipart) {
					op.requestBody = {
						required: Boolean(body || multipart),
						content: {
							[multipart ? "multipart/form-data" : "application/json"]: {
								schema: multipart
									? { type: "object", properties: { file: { type: "string", format: "binary" } }, required: ["file"] }
									: body
										? schemaForType(body, controllerContext)
										: { type: "object", additionalProperties: true },
							},
						},
					};
				}

				const status = mapping.method === "post" && /ResponseStatus\s*\(\s*HttpStatus\.CREATED\s*\)/.test(block)
					? "201"
					: mapping.method === "delete"
						? "204"
						: "200";
				const ret = returnType(signature);
				addJsonResponse(op, status, mapping.method === "head" || ret === "void" || ret === "Void" ? undefined : schemaForType(ret, controllerContext));
				op.responses.default = {
					description: "Error response",
					content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
				};
				if (hasSecured(block) || /^\/api\/(user|achievements|rewards|internal)\b/.test(routePath) || routePath.includes("/saved") || routePath.includes("/workshop")) {
					op.security = [{ bearerAuth: [] }];
				}

				paths[routePath] ||= {};
				paths[routePath][mapping.method] = op;
			}
		}
	}
	return { paths, tags };
}

function mergeEquivalentPaths(paths) {
	const merges = {
		"/api/v2/backgrounds/{backgroundUrl}": "/api/v2/backgrounds/{url}",
		"/api/v2/item/{itemUrl}": "/api/v2/item/{url}",
		"/api/v2/magic-items/{itemUrl}": "/api/v2/magic-items/{url}",
		"/api/v2/menu/{oldUrl}": "/api/v2/menu/{url}",
	};
	for (const [from, to] of Object.entries(merges)) {
		if (!paths[from]) continue;
		paths[to] ||= {};
		for (const [method, op] of Object.entries(paths[from])) {
			for (const param of op.parameters ?? []) {
				if (param.in === "path") param.name = "url";
			}
			paths[to][method] = op;
		}
		delete paths[from];
	}
}

function addLegacyPaths(paths) {
	const legacyEntities = {
		spells: "LegacySpellResponse",
		classes: "LegacyClassResponse",
		races: "LegacyRaceResponse",
		screens: "LegacyDmScreenResponse",
		bestiary: "LegacyMonsterResponse",
		items: "LegacyEquipmentItemResponse",
		"magic-items": "LegacyMagicItemResponse",
		backgrounds: "LegacyBackgroundResponse",
		feats: "LegacyFeatResponse",
		weapons: "LegacyWeaponResponse",
		armor: "LegacyArmorResponse",
		equipment: "LegacyEquipmentItemResponse",
	};
	for (const [entity, schemaName] of Object.entries(legacyEntities)) {
		const routePath = `/api/v1/${entity}/{url}`;
		paths[routePath] ||= {};
		paths[routePath].post = {
			tags: ["Legacy v1"],
			summary: `Legacy ${entity} detail lookup`,
			operationId: `post_api_v1_${entity.replace(/-/g, "_")}_url`,
			deprecated: true,
			"x-source": "dnd-dm-tools-legacy-integration",
			parameters: [{ name: "url", in: "path", required: true, schema: { type: "string" } }],
			requestBody: { required: false, content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyFilterRequest" } } } },
			responses: {
				"200": { description: "Legacy item JSON response", content: { "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } } } },
				default: { description: "Error response", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
			},
		};
	}
	paths["/classes/fragment/{url}"] = {
		get: {
			tags: ["Legacy fragments"],
			summary: "Legacy class HTML fragment lookup",
			operationId: "get_classes_fragment_url",
			deprecated: true,
			"x-source": "dnd-dm-tools-legacy-integration",
			parameters: [{ name: "url", in: "path", required: true, schema: { type: "string" }, description: "Class or subclass URL slug." }],
			responses: {
				"200": { description: "HTML fragment", content: { "text/html": { schema: { type: "string" } } } },
				default: { description: "Error response", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
			},
		},
	};
	paths["/backgrounds/fragment/{id}"] = {
		get: {
			tags: ["Legacy fragments"],
			summary: "Legacy background HTML fragment lookup",
			operationId: "get_backgrounds_fragment_id",
			deprecated: true,
			"x-source": "dnd-dm-tools-legacy-integration",
			parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Background fragment identifier returned by the legacy item response." }],
			responses: {
				"200": { description: "HTML fragment", content: { "text/html": { schema: { type: "string" } } } },
				default: { description: "Error response", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
			},
		},
	};
	paths["/api/v1/comments/count"] = {
		get: {
			tags: ["Legacy v1"],
			summary: "Legacy comment count lookup",
			operationId: "get_api_v1_comments_count",
			deprecated: true,
			"x-source": "new.ttg.club-public-page",
			parameters: [
				{ name: "sourcePlatform", in: "query", required: false, schema: { type: "string" } },
				{ name: "section", in: "query", required: false, schema: { type: "string" } },
				{ name: "url", in: "query", required: false, schema: { type: "string" } },
			],
			responses: {
				"200": { description: "Comment count response", content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyCommentCountResponse" } } } },
				default: { description: "Error response", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
			},
		},
	};
}

function removeBooleanAdditionalProperties(value) {
	if (!value || typeof value !== "object") return;
	if (Array.isArray(value)) {
		for (const item of value) removeBooleanAdditionalProperties(item);
		return;
	}
	for (const [key, child] of Object.entries(value)) {
		if (key === "additionalProperties" && child === true) {
			delete value[key];
			continue;
		}
		removeBooleanAdditionalProperties(child);
	}
}

const { paths, tags } = generateControllerPaths();
mergeEquivalentPaths(paths);
addLegacyPaths(paths);

const htmlString = { type: "string", description: "Legacy HTML string." };
const legacyBaseItemProperties = {
	name: { $ref: "#/components/schemas/LegacyName" },
	url: { type: "string" },
	source: { $ref: "#/components/schemas/LegacySource" },
	id: { type: "integer", format: "int32" },
	homebrew: { type: "boolean" },
};
const legacyTextBlock = {
	type: "object",
	properties: {
		id: { oneOf: [{ type: "integer", format: "int32" }, { type: "string" }] },
		name: { type: "string" },
		suffix: { type: "string" },
		level: { type: "integer", format: "int32" },
		type: { type: "string" },
		description: htmlString,
		source: { $ref: "#/components/schemas/LegacySource" },
		optional: { type: "boolean" },
		child: { nullable: true, oneOf: [{ type: "string" }, { type: "integer", format: "int32" }] },
		anchor: { type: "string" },
		tooltipUrl: { type: "string" },
		archetypeFeature: { type: "boolean" },
		archetypeRoot: { type: "boolean" },
	},
	additionalProperties: true,
};

const legacyResponseSchemas = {
	LegacyName: {
		type: "object",
		properties: {
			rus: { type: "string" },
			eng: { type: "string" },
		},
		required: ["rus", "eng"],
		additionalProperties: true,
	},
	LegacySource: {
		type: "object",
		properties: {
			shortName: { type: "string" },
			name: { type: "string" },
			group: {
				type: "object",
				properties: {
					name: { type: "string" },
					shortName: { type: "string" },
				},
				additionalProperties: true,
			},
			page: { type: "integer", format: "int32" },
			homebrew: { type: "boolean" },
		},
		required: ["shortName", "name", "group"],
		additionalProperties: true,
	},
	LegacyType: {
		type: "object",
		properties: {
			name: { type: "string" },
			order: { type: "integer", format: "int32" },
		},
		additionalProperties: true,
	},
	LegacyLink: {
		type: "object",
		properties: {
			name: { type: "string" },
			url: { type: "string", nullable: true },
			icon: { type: "string" },
			class: { type: "string" },
			type: { $ref: "#/components/schemas/LegacyType" },
			source: { $ref: "#/components/schemas/LegacySource" },
		},
		additionalProperties: true,
	},
	LegacyComponents: {
		type: "object",
		properties: {
			v: { type: "boolean" },
			s: { type: "boolean" },
			m: { type: "string" },
		},
		additionalProperties: true,
	},
	LegacyDamage: {
		type: "object",
		properties: {
			dice: { type: "string" },
			type: { type: "string" },
		},
		additionalProperties: true,
	},
	LegacyPrice: {
		type: "object",
		properties: {
			dmg: { type: "string", nullable: true },
			xge: { type: "string", nullable: true },
		},
		additionalProperties: true,
	},
	LegacySpeed: {
		type: "object",
		properties: {
			value: { type: "integer", format: "int32" },
			name: { type: "string" },
			additional: { type: "string" },
		},
		additionalProperties: true,
	},
	LegacyAbility: {
		type: "object",
		properties: {
			str: { type: "integer", format: "int32" },
			dex: { type: "integer", format: "int32" },
			con: { type: "integer", format: "int32" },
			int: { type: "integer", format: "int32" },
			wiz: { type: "integer", format: "int32" },
			cha: { type: "integer", format: "int32" },
		},
		additionalProperties: true,
	},
	LegacyHits: {
		type: "object",
		properties: {
			average: { type: "integer", format: "int32" },
			formula: { type: "string" },
			sign: { type: "string" },
			bonus: { type: "integer", format: "int32" },
			text: { type: "string" },
		},
		additionalProperties: true,
	},
	LegacyNamedValue: {
		type: "object",
		properties: {
			name: { type: "string" },
			value: { oneOf: [{ type: "string" }, { type: "number" }] },
		},
		additionalProperties: true,
	},
	LegacySpellResponse: {
		type: "object",
		description: "Legacy /api/v1 spell response, sampled from ttg.club and consumed by dnd-dm-tools.",
		properties: {
			...legacyBaseItemProperties,
			level: { type: "integer", format: "int32" },
			school: { type: "string" },
			additionalType: { type: "string" },
			components: { $ref: "#/components/schemas/LegacyComponents" },
			concentration: { type: "boolean" },
			ritual: { type: "boolean" },
			range: { type: "string" },
			duration: { type: "string" },
			time: { type: "string" },
			classes: { type: "array", items: { $ref: "#/components/schemas/LegacyLink" } },
			subclasses: { type: "array", items: { $ref: "#/components/schemas/LegacyLink" } },
			description: htmlString,
			upper: htmlString,
		},
		required: ["name", "url", "source", "level", "school", "components", "range", "duration", "time", "description"],
		additionalProperties: true,
	},
	LegacyClassResponse: {
		type: "object",
		description: "Legacy /api/v1 class or archetype response. Class bodies contain large nested trait/level/feature structures.",
		properties: {
			...legacyBaseItemProperties,
			dice: { type: "string" },
			isArchetype: { type: "boolean" },
			parentClassUrl: { type: "string" },
			archetypes: { type: "array", items: { $ref: "#/components/schemas/LegacyClassSummary" } },
			image: { type: "string" },
			icon: { type: "string" },
			archetypeName: { type: "string" },
			sidekick: { type: "boolean" },
			tabs: { type: "array", items: { $ref: "#/components/schemas/LegacyClassTab" } },
			images: { type: "array", items: { type: "string" } },
			traits: { type: "object", additionalProperties: true },
			levels: { type: "array", items: { type: "object", additionalProperties: true } },
			features: { type: "array", items: legacyTextBlock },
			associatedUrl: { type: "string" },
			associatedHtml: htmlString,
		},
		required: ["name", "url", "source", "dice"],
		additionalProperties: true,
	},
	LegacyClassSummary: {
		type: "object",
		properties: {
			name: { $ref: "#/components/schemas/LegacyName" },
			type: { $ref: "#/components/schemas/LegacyType" },
			source: { $ref: "#/components/schemas/LegacySource" },
			url: { type: "string" },
		},
		additionalProperties: true,
	},
	LegacyClassTab: {
		type: "object",
		properties: {
			name: { type: "string" },
			url: { type: "string" },
			type: { type: "string" },
			order: { type: "integer", format: "int32" },
			raw: { type: "boolean" },
		},
		additionalProperties: true,
	},
	LegacyRaceResponse: {
		type: "object",
		description: "Legacy /api/v1 race response. Names may be objects or strings on older payloads.",
		properties: {
			...legacyBaseItemProperties,
			abilities: { type: "array", items: { type: "object", additionalProperties: true } },
			type: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/LegacyType" }] },
			image: { type: "string" },
			group: { $ref: "#/components/schemas/LegacyType" },
			description: htmlString,
			size: { type: "string" },
			speed: { type: "array", items: { $ref: "#/components/schemas/LegacySpeed" } },
			skills: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			subraces: { type: "array", items: { $ref: "#/components/schemas/LegacyRaceResponse" } },
		},
		required: ["name", "url", "source"],
		additionalProperties: true,
	},
	LegacyDmScreenResponse: {
		type: "object",
		description: "Legacy /api/v1 DM screen item or description refresh response.",
		properties: {
			...legacyBaseItemProperties,
			order: { type: "integer", format: "int32" },
			description: htmlString,
			group: { type: "string" },
			icon: { type: "string" },
			parentUrl: { type: "string" },
			children: { type: "array", items: { $ref: "#/components/schemas/LegacyDmScreenResponse" } },
		},
		required: ["name", "url", "source"],
		additionalProperties: true,
	},
	LegacyMonsterResponse: {
		type: "object",
		description: "Legacy /api/v1 monster response consumed by the bestiary and initiative tracker.",
		properties: {
			...legacyBaseItemProperties,
			type: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/LegacyType" }] },
			challengeRating: { type: "string" },
			size: { type: "object", additionalProperties: true },
			experience: { type: "integer", format: "int32" },
			proficiencyBonus: { type: "string" },
			alignment: { type: "string" },
			armorClass: { type: "integer", format: "int32" },
			armors: { type: "array", items: { type: "object", additionalProperties: true } },
			hits: { $ref: "#/components/schemas/LegacyHits" },
			speed: { type: "array", items: { $ref: "#/components/schemas/LegacySpeed" } },
			ability: { $ref: "#/components/schemas/LegacyAbility" },
			savingThrows: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			skills: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			damageVulnerabilities: { type: "array", items: { type: "string" } },
			damageResistances: { type: "array", items: { type: "string" } },
			damageImmunities: { type: "array", items: { type: "string" } },
			conditionImmunities: { type: "array", items: { type: "string" } },
			senses: { type: "object", additionalProperties: true },
			languages: { type: "array", items: { type: "string" } },
			feats: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			actions: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			bonusActions: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			reactions: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			legendary: { type: "object", additionalProperties: true },
			mythic: { type: "object", additionalProperties: true },
			lair: { type: "object", additionalProperties: true },
			description: htmlString,
			tags: { type: "array", items: { $ref: "#/components/schemas/LegacyNamedValue" } },
			environment: { type: "array", items: { type: "string" } },
			images: { type: "array", items: { type: "string" } },
		},
		required: ["name", "url", "source", "type", "challengeRating", "images"],
		additionalProperties: true,
	},
	LegacyEquipmentItemResponse: {
		type: "object",
		description: "Legacy /api/v1 mundane equipment response.",
		properties: {
			...legacyBaseItemProperties,
			price: { type: "string" },
			weight: { type: "number" },
			description: htmlString,
			categories: { type: "array", items: { type: "string" } },
		},
		required: ["name", "url", "source", "description", "categories"],
		additionalProperties: true,
	},
	LegacyMagicItemResponse: {
		type: "object",
		description: "Legacy /api/v1 magic item/artifact response.",
		properties: {
			...legacyBaseItemProperties,
			type: { $ref: "#/components/schemas/LegacyType" },
			price: { $ref: "#/components/schemas/LegacyPrice" },
			rarity: { type: "object", additionalProperties: true },
			customization: { type: "boolean" },
			description: htmlString,
			detailType: { type: "array", items: { type: "object", additionalProperties: true } },
			cost: { $ref: "#/components/schemas/LegacyPrice" },
			images: { type: "array", items: { type: "string" } },
			detailCustomization: { type: "array", items: { type: "string" } },
		},
		required: ["name", "url", "source", "type", "price", "rarity", "description"],
		additionalProperties: true,
	},
	LegacyBackgroundResponse: {
		type: "object",
		description: "Legacy /api/v1 background response. Some flows pair it with a separate HTML fragment.",
		properties: {
			...legacyBaseItemProperties,
			associatedUrl: { type: "string" },
			associatedHtml: htmlString,
			skills: { type: "array", items: { type: "string" } },
			toolOwnership: htmlString,
			equipments: { type: "array", items: { type: "string" } },
			startGold: { type: "integer", format: "int32" },
			description: htmlString,
			personalization: htmlString,
		},
		required: ["name", "url", "source", "skills", "toolOwnership", "equipments", "startGold", "description"],
		additionalProperties: true,
	},
	LegacyFeatResponse: {
		type: "object",
		description: "Legacy /api/v1 feat response.",
		properties: {
			...legacyBaseItemProperties,
			requirements: { type: "string" },
			description: htmlString,
		},
		required: ["name", "url", "source", "requirements", "description"],
		additionalProperties: true,
	},
	LegacyWeaponResponse: {
		type: "object",
		description: "Legacy /api/v1 weapon response.",
		properties: {
			...legacyBaseItemProperties,
			type: { $ref: "#/components/schemas/LegacyType" },
			damage: { $ref: "#/components/schemas/LegacyDamage" },
			price: { type: "string" },
			weight: { type: "number" },
			special: htmlString,
			description: htmlString,
			properties: { type: "array", items: { type: "object", additionalProperties: true } },
		},
		required: ["name", "url", "source", "type", "damage", "price", "weight", "properties"],
		additionalProperties: true,
	},
	LegacyArmorResponse: {
		type: "object",
		description: "Legacy /api/v1 armor response.",
		properties: {
			...legacyBaseItemProperties,
			type: { $ref: "#/components/schemas/LegacyType" },
			armorClass: { type: "string" },
			price: { type: "string" },
			weight: { type: "number" },
			description: htmlString,
			disadvantage: { type: "boolean" },
			requirement: { type: "integer", format: "int32" },
			duration: { type: "string" },
		},
		required: ["name", "url", "source", "type", "armorClass", "price", "weight", "description", "duration"],
		additionalProperties: true,
	},
	LegacyCommentCountResponse: {
		type: "object",
		description: "Legacy comment count response observed on public pages.",
		properties: {
			count: { type: "integer", format: "int32" },
			total: { type: "integer", format: "int32" },
		},
		additionalProperties: true,
	},
};

const schemas = {
	ErrorResponse: {
		type: "object",
		properties: {
			status: { type: "integer", format: "int32" },
			error: { type: "string" },
			message: { type: "string" },
			path: { type: "string" },
			timestamp: { type: "string", format: "date-time" },
		},
		additionalProperties: true,
	},
	LegacyFilterRequest: {
		type: "object",
		properties: {
			filter: {
				type: "object",
				properties: {
					book: { type: "array", items: { type: "string" } },
				},
				additionalProperties: true,
			},
		},
		additionalProperties: true,
	},
	...legacyResponseSchemas,
	MarkupContent: {
		description: "TTG markup content serialized by MarkupDescriptionSerializer. Public GET responses can contain plain strings and structured block arrays.",
		oneOf: [
			{ type: "string" },
			{
				type: "array",
				items: {
					oneOf: [
						{ type: "string" },
						{ type: "object", additionalProperties: true },
					],
				},
			},
			{ type: "object", additionalProperties: true },
		],
	},
	...Object.fromEntries([...generatedSchemas.entries()].sort(([a], [b]) => a.localeCompare(b))),
};

const spec = {
	openapi: "3.0.3",
	info: {
		title: "TTG Club public and legacy API",
		version: "2026-08-01",
		description: "OpenAPI artifact generated from public TTG-Club/core-api controller and DTO source plus legacy endpoint evidence used by dnd-dm-tools. Legacy /api/v1 operations are deprecated/inferred and should not be used for new plugin runtime request code.",
		contact: { name: "TTG Club", url: "https://ttg.club", email: "support@ttg.club" },
	},
	externalDocs: { description: "TTG Club core-api source", url: "https://github.com/TTG-Club/core-api" },
	servers: [{ url: "https://ttg.club" }, { url: "https://new.ttg.club" }],
	tags: [...tags.values()].sort((a, b) => a.name.localeCompare(b.name, "ru")).concat([{ name: "Legacy v1" }, { name: "Legacy fragments" }]),
	paths: Object.fromEntries(Object.entries(paths).sort(([a], [b]) => a.localeCompare(b))),
	components: {
		securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
		schemas,
	},
};

removeBooleanAdditionalProperties(spec);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`wrote ${outputPath}`);
console.log(`${Object.keys(spec.paths).length} paths, ${Object.values(spec.paths).reduce((sum, methods) => sum + Object.keys(methods).length, 0)} operations, ${Object.keys(spec.components.schemas).length} schemas`);
