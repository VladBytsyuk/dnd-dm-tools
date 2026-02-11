// Pre-compiled regexes for performance
const VALID_CHARS_REGEX = /^[0-9+\-*/().\s]+$/;
const DIGIT_OR_DOT_REGEX = /[0-9.]/;
const NUMBER_REGEX = /^[0-9.]+$/;

/**
 * Evaluates numeric expressions with basic arithmetic operations.
 * Supports: +, -, *, /, parentheses
 *
 * @param exprRaw - The expression string to evaluate (e.g., "10+5", "20-3*2", "15/3+1", "-5")
 * @returns The evaluated number, or null if the expression is invalid
 *
 * @example
 * evalNumericExpression("10+5") // Returns: 15
 * evalNumericExpression("20-3*2") // Returns: 14
 * evalNumericExpression("15/3+1") // Returns: 6
 * evalNumericExpression("-5") // Returns: -5
 * evalNumericExpression("invalid") // Returns: null
 */
export function evalNumericExpression(exprRaw: string): number | null {
	const expr = (exprRaw ?? "").trim();
	if (!expr.length) return null;

	// If expression contains only valid characters for math
	if (!VALID_CHARS_REGEX.test(expr)) {
		const n = Number(expr);
		return Number.isFinite(n) ? n : null;
	}

	// Tokenize the expression
	const tokens: string[] = [];
	let i = 0;
	while (i < expr.length) {
		const c = expr[i];
		// Skip whitespace
		if (c === " " || c === "\t" || c === "\n") {
			i++;
			continue;
		}
		// Parse numbers (including decimals)
		if (DIGIT_OR_DOT_REGEX.test(c)) {
			let j = i + 1;
			let hasDecimal = c === '.';
			while (j < expr.length && DIGIT_OR_DOT_REGEX.test(expr[j])) {
				if (expr[j] === '.') {
					if (hasDecimal) return null; // Multiple decimal points
					hasDecimal = true;
				}
				j++;
			}
			tokens.push(expr.slice(i, j));
			i = j;
			continue;
		}
		// Parse operators and parentheses
		if ("+-*/()".includes(c)) {
			tokens.push(c);
			i++;
			continue;
		}
		// Invalid character
		return null;
	}

	// Handle unary minus: convert "-x" to "0 - x"
	const fixed: string[] = [];
	for (let k = 0; k < tokens.length; k++) {
		const t = tokens[k];
		if (t === "-" && (k === 0 || tokens[k - 1] === "(" || "+-*/".includes(tokens[k - 1]))) {
			fixed.push("0", "-");
		} else {
			fixed.push(t);
		}
	}

	// Convert infix to postfix using Shunting Yard algorithm
	const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
	const out: string[] = [];
	const ops: string[] = [];

	for (const t of fixed) {
		// Numbers go directly to output
		if (NUMBER_REGEX.test(t)) {
			out.push(t);
			continue;
		}
		// Operators
		if (t in prec) {
			while (ops.length) {
				const top = ops[ops.length - 1];
				if (top in prec && prec[top] >= prec[t]) out.push(ops.pop()!);
				else break;
			}
			ops.push(t);
			continue;
		}
		// Left parenthesis
		if (t === "(") {
			ops.push(t);
			continue;
		}
		// Right parenthesis
		if (t === ")") {
			while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
			if (!ops.length) return null;
			ops.pop();
			continue;
		}
		return null;
	}

	// Pop remaining operators
	while (ops.length) {
		const op = ops.pop()!;
		if (op === "(" || op === ")") return null;
		out.push(op);
	}

	// Evaluate postfix expression
	const stack: number[] = [];
	for (const t of out) {
		if (NUMBER_REGEX.test(t)) {
			const n = Number(t);
			if (!Number.isFinite(n)) return null;
			stack.push(n);
			continue;
		}
		const b = stack.pop();
		const a = stack.pop();
		if (a == null || b == null) return null;

		let r = 0;
		if (t === "+") r = a + b;
		else if (t === "-") r = a - b;
		else if (t === "*") r = a * b;
		else if (t === "/") r = a / b;
		else return null;

		if (!Number.isFinite(r)) return null;
		stack.push(r);
	}
	return stack.length === 1 ? stack[0] : null;
}
