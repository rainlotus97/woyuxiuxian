#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
from pathlib import Path
from collections import Counter

from PIL import Image


def parse_hex_color(value: str) -> tuple[int, int, int]:
    text = value.strip().lstrip("#")
    if len(text) != 6:
        raise ValueError(f"invalid color: {value}")
    return tuple(int(text[i:i + 2], 16) for i in (0, 2, 4))


def sample_border_matte(image: Image.Image, inset: int = 6, step: int = 8) -> tuple[int, int, int]:
    width, height = image.size
    pixels = image.load()
    samples: list[tuple[int, int, int]] = []

    y_positions = {0, min(inset, height - 1), max(height - 1 - inset, 0), height - 1}
    x_positions = {0, min(inset, width - 1), max(width - 1 - inset, 0), width - 1}

    for y in y_positions:
      for x in range(0, width, step):
          r, g, b, _ = pixels[x, y]
          samples.append((r, g, b))

    for x in x_positions:
      for y in range(0, height, step):
          r, g, b, _ = pixels[x, y]
          samples.append((r, g, b))

    if not samples:
        return (0, 255, 0)

    ranked = Counter(samples).most_common(12)
    return (
        round(sum(color[0] * count for color, count in ranked) / sum(count for _, count in ranked)),
        round(sum(color[1] * count for color, count in ranked) / sum(count for _, count in ranked)),
        round(sum(color[2] * count for color, count in ranked) / sum(count for _, count in ranked)),
    )


def remove_matte(
    source_path: Path,
    output_path: Path,
    matte_rgb: tuple[int, int, int],
    tolerance: float,
    softness: float,
) -> None:
    image = Image.open(source_path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            distance = math.sqrt(
                (r - matte_rgb[0]) ** 2
                + (g - matte_rgb[1]) ** 2
                + (b - matte_rgb[2]) ** 2
            )

            if distance <= tolerance:
                pixels[x, y] = (r, g, b, 0)
                continue

            if softness > 0 and distance <= tolerance + softness:
                ratio = (distance - tolerance) / softness
                alpha = int(max(0, min(255, a * ratio)))
                pixels[x, y] = (r, g, b, alpha)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)


def derive_output(source_path: Path) -> Path:
    stem = source_path.stem
    if stem.endswith("-matte"):
        stem = stem[:-6]
    return source_path.with_name(f"{stem}.png")


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove a solid matte key color and export transparent PNG.")
    parser.add_argument("--input", required=True, help="Source PNG path")
    parser.add_argument("--output", help="Destination PNG path")
    parser.add_argument("--color", default="#00FF00", help="Matte key color, default #00FF00")
    parser.add_argument("--auto-border-color", action="store_true", help="Sample matte color from border pixels")
    parser.add_argument("--tolerance", type=float, default=26.0, help="Hard remove distance")
    parser.add_argument("--softness", type=float, default=18.0, help="Soft feather distance")
    args = parser.parse_args()

    source_path = Path(args.input)
    output_path = Path(args.output) if args.output else derive_output(source_path)
    source_image = Image.open(source_path).convert("RGBA")
    matte_rgb = sample_border_matte(source_image) if args.auto_border_color else parse_hex_color(args.color)

    remove_matte(
        source_path=source_path,
        output_path=output_path,
        matte_rgb=matte_rgb,
        tolerance=args.tolerance,
        softness=args.softness,
    )

    print(f"Transparent PNG written to {output_path}")


if __name__ == "__main__":
    main()
