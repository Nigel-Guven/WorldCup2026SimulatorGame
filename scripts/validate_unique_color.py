import re
import sys
from collections import defaultdict
from pathlib import Path


def validate_unique_rgb(file_path: str) -> bool:
    path = Path(file_path)
    if not path.is_file():
        print(f"Error: File '{file_path}' not found.", file=sys.stderr)
        return False

    # Matches: "map_colour": { "r": 3, "g": 148, "b": 250 } and optional // comment
    # Flexible with whitespace and supports both "map_colour" and "map_color"
    pattern = re.compile(
        r'"map_colou?r"\s*:\s*\{\s*'
        r'"r"\s*:\s*(\d+)\s*,\s*'
        r'"g"\s*:\s*(\d+)\s*,\s*'
        r'"b"\s*:\s*(\d+)\s*\}'
        r'(?:\s*//\s*(.*))?'
    )

    # Store occurrences as: (r, g, b) -> [(line_number, comment), ...]
    seen_colors = defaultdict(list)

    with path.open("r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            match = pattern.search(line)
            if match:
                r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
                comment = (match.group(4) or "No comment").strip()
                seen_colors[(r, g, b)].append((line_num, comment))

    # Filter for colors that appear more than once
    duplicates = {
        rgb: occurrences
        for rgb, occurrences in seen_colors.items()
        if len(occurrences) > 1
    }

    if not duplicates:
        print(f"✅ Success: All {len(seen_colors)} RGB colors in '{file_path}' are unique.")
        return True

    print(f"❌ Found {len(duplicates)} duplicate RGB color(s) in '{file_path}':\n")
    for (r, g, b), occurrences in duplicates.items():
        print(f"RGB({r}, {g}, {b}):")
        for line_num, comment in occurrences:
            print(f"  - Line {line_num}: {comment}")
        print()

    return False


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <path_to_file>")
        sys.exit(1)

    is_valid = validate_unique_rgb(sys.argv[1])
    sys.exit(0 if is_valid else 1)