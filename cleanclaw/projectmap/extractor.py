import re
from pathlib import Path

# Per-extension patterns: each yields (method_name, signature, output)
_PATTERNS: dict[str, re.Pattern] = {
    ".ts":  re.compile(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(\([^)]*\))\s*(?::\s*([^\{]+?))?(?:\s*\{|$)", re.MULTILINE),
    ".tsx": re.compile(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(\([^)]*\))\s*(?::\s*([^\{]+?))?(?:\s*\{|$)", re.MULTILINE),
    ".cs":  re.compile(r"(?:public|private|protected|internal|static|async|override|virtual)\s+(?:\w+[\w<>\[\]?,\s]*)\s+(\w+)\s*(\([^)]*\))\s*(?:where[^{]*)?\{", re.MULTILINE),
    ".py":  re.compile(r"^\s*(?:async\s+)?def\s+(\w+)\s*(\([^)]*\))\s*(?:->\s*([^\:]+))?:", re.MULTILINE),
    ".php": re.compile(r"(?:public|private|protected|static|\s)+function\s+(\w+)\s*(\([^)]*\))", re.MULTILINE),
}

_CODE_EXTENSIONS = set(_PATTERNS.keys())


def extract_methods(file_path: str, content: str) -> list[dict]:
    """Extract method entries from source content. Returns list of row dicts."""
    ext = Path(file_path).suffix.lower()
    pattern = _PATTERNS.get(ext)
    if pattern is None:
        return []

    rows = []
    for match in pattern.finditer(content):
        groups = match.groups()
        method_name = groups[0].strip()
        signature = f"{method_name}{groups[1].strip()}" if len(groups) > 1 else method_name
        output = groups[2].strip() if len(groups) > 2 and groups[2] else ""
        rows.append({
            "method_name": method_name,
            "signature": signature,
            "output": output,
            "filename": Path(file_path).name,
            "full_path": file_path,
            "metadata": "",
            "algorithm": "",
        })
    return rows


def is_code_file(file_path: str) -> bool:
    return Path(file_path).suffix.lower() in _CODE_EXTENSIONS


def embed_text_for_method(row: dict) -> str:
    """Produce the text that gets embedded for a method row."""
    parts = [row["method_name"], row["signature"]]
    if row["output"]:
        parts.append(f"returns {row['output']}")
    parts.append(row["full_path"])
    return " | ".join(parts)


def embed_text_for_misc(row: dict) -> str:
    """Produce the text that gets embedded for a misc row."""
    return f"{row['filename']} | {row['purpose']} | {row['related_layer']}"
