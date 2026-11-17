import re
import sys
from pathlib import Path
import numpy as np
from PIL import Image


def load_defined_colors(txt_path: Path) -> dict[tuple[int, int, int], str]:
    """Parses region_colors.txt and returns a dict mapping (r, g, b) -> region name."""
    pattern = re.compile(
        r'"map_colou?r"\s*:\s*\{\s*'
        r'"r"\s*:\s*(\d+)\s*,\s*'
        r'"g"\s*:\s*(\d+)\s*,\s*'
        r'"b"\s*:\s*(\d+)\s*\}'
        r'(?:\s*//\s*(.*))?'
    )

    colors = {}
    with txt_path.open("r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            match = pattern.search(line)
            if match:
                r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
                name = (match.group(4) or f"Line {line_num}").strip()
                colors[(r, g, b)] = name

    return colors


def validate_map(txt_file: str = "region_colors.txt", img_file: str = "nations_map.png") -> bool:
    base_dir = Path(__file__).parent
    txt_path = base_dir / txt_file
    img_path = base_dir / img_file

    if not txt_path.is_file() or not img_path.is_file():
        print(f"Error: Ensure both '{txt_file}' and '{img_file}' exist in {base_dir}", file=sys.stderr)
        return False

    defined_colors = load_defined_colors(txt_path)
    # Add water (255, 255, 255) as a valid known color
    valid_colors = set(defined_colors.keys())
    valid_colors.add((255, 255, 255))

    print(f"Loaded {len(defined_colors)} regions (+ white water) from '{txt_file}'.")
    print(f"Scanning '{img_file}'...")

    # Load image and ensure it is 3-channel RGB (strips alpha channel if present)
    with Image.open(img_path) as img:
        rgb_img = img.convert("RGB")
        pixels = np.array(rgb_img)  # Shape: (height, width, 3)

    # Extract all unique RGB colors present in the image
    unique_map_colors = np.unique(pixels.reshape(-1, 3), axis=0)
    map_color_set = {tuple(int(c) for c in rgb) for rgb in unique_map_colors}

    # 1. Check for colors on the map that are NOT in region_colors.txt
    unknown_colors = sorted(map_color_set - valid_colors)

    # 2. Bonus check: Regions in region_colors.txt that have 0 pixels on the map
    unused_regions = {
        rgb: name for rgb, name in defined_colors.items() if rgb not in map_color_set
    }

    has_errors = False

    if unknown_colors:
        has_errors = True
        print(f"\n❌ Found {len(unknown_colors)} unknown RGB color(s) on '{img_file}':\n")
        for rgb in unknown_colors:
            # Find all (y, x) indices where the pixel matches this RGB color
            ys, xs = np.where(np.all(pixels == rgb, axis=-1))
            count = len(xs)
            first_x, first_y = int(xs[0]), int(ys[0])

            # Show up to 5 sample coordinates so anti-aliasing artifacts don't flood your terminal
            samples = ", ".join(f"({x}, {y})" for x, y in zip(xs[:5], ys[:5]))
            more_text = f" ... and {count - 5} more" if count > 5 else ""

            print(f"RGB{rgb} — {count} pixel(s)")
            print(f"  First seen at: X={first_x}, Y={first_y}")
            print(f"  Coordinates:   {samples}{more_text}\n")
    else:
        print(f"\n✅ All {len(map_color_set)} colors on '{img_file}' are accounted for!")

    if unused_regions:
        print(f"⚠️  Note: {len(unused_regions)} region(s) in '{txt_file}' were not found anywhere on the map:")
        for rgb, name in unused_regions.items():
            print(f"  - {name}: RGB{rgb}")

    return not has_errors


if __name__ == "__main__":
    success = validate_map()
    sys.exit(0 if success else 1)