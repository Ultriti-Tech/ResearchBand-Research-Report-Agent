from difflib import unified_diff
import re
from typing import NamedTuple


class _Match(NamedTuple):
    start: int
    end: int


# -------------------
# this funtion convert whitespace to \s+ allowing one or more spaces, tabs, or newlines to match.
# re.split(): Splits text while preserving whitespace.
# re.escape(): Treats special regex characters as normal text.
# \s+: Matches one or more whitespace characters.
def _whitespace_flexible_pattern(text: str) -> str:
    parts = re.split(r"(\s+)", text)
    return "".join(r"\s+" if part.isspace() else re.escape(part) for part in parts)


def _context_matches(text: str, context: str, *, before: bool) -> bool:

    if not context:
        return True

    pattern = _whitespace_flexible_pattern(context.strip())

    if before:
        # Allow whitespace/newlines after the before-context
        return re.search(pattern + r"\s*$", text) is not None

    # Allow whitespace/newlines before the after-context
    return re.match(r"^\s*" + pattern, text) is not None



def _find_target(original: str, change) -> _Match:
    print("finding target ...")
    print("original--------------------------------------\n", original)
    print("change--------------------------------------\n", change)
    if not change.old_text:
        raise ValueError("Target text cannot be empty")

    matches = []
    pattern = re.compile(_whitespace_flexible_pattern(change.old_text))

    print(pattern)

    start = 0
    while True:
        match = pattern.search(original, start)
        if match is None:
            break
        before_matches = _context_matches(
            original[: match.start()], change.before_context, before=True
        )
        after_matches = _context_matches(
            original[match.end() :], change.after_context, before=False
        )

        print("before n afet context", before_matches)
        print("before n afet context", after_matches)

        if before_matches and after_matches:
            print("_Match(match.start(), match.end())",_Match(match.start(), match.end()))
            matches.append(_Match(match.start(), match.end()))
        start = match.start() + 1

    print("matches", matches)
    if not matches:
        raise ValueError("Target text or its context was not found")
    if len(matches) != 1:
        raise ValueError("Target text is ambiguous; provide more context")
    return matches[0]


def apply_patch(original: str, patch):
    print("apply patch funtioj run ...")
    print(patch)

    replacements = []
    for change in patch.changes:
        match = _find_target(original, change)
        
        print("match in apply patch ....",match)
        replacements.append((match.start, match.end, change.new_text))

    ordered = sorted(replacements)
    
    print("replacements",replacements)
    print("ordered",ordered)
    
    for previous, current in zip(ordered, ordered[1:]):
        if current[0] < previous[1]:
            raise ValueError("Patch targets overlap")

    updated = original
    
    for start, end, new_text in reversed(ordered):
        updated = updated[:start] + new_text + updated[end:]
        
    print("original",original)
    print("updated",updated)

    print("aaplying chnages")

    diff = unified_diff(
        original.splitlines(keepends=True),
        updated.splitlines(keepends=True),
        fromfile="original",
        tofile="updated",
    )
    return updated, "".join(diff)
