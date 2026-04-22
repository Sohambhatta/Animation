from __future__ import annotations

from pathlib import Path
import re
from typing import List

from flask import Flask, render_template, url_for

app = Flask(__name__)

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def load_memory_images() -> List[str]:
    """Load memory image URLs from static/images/memories.

    Drop your images into that folder and they will appear automatically.
    """
    memories_dir = Path(app.static_folder) / "images" / "memories"
    memories_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(
        [
            path
            for path in memories_dir.iterdir()
            if (
                path.is_file()
                and path.suffix.lower() in SUPPORTED_EXTENSIONS
                and re.match(r"^img[_-]?\d+", path.stem, re.IGNORECASE)
            )
        ]
    )

    return [url_for("static", filename=f"images/memories/{file.name}") for file in files]


def load_hidden_reveal_image() -> str | None:
    """Load the dedicated hidden reveal image from static/images/memories."""
    memories_dir = Path(app.static_folder) / "images" / "memories"
    memories_dir.mkdir(parents=True, exist_ok=True)

    files = [
        path
        for path in memories_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    preferred = sorted(
        [
            path
            for path in files
            if "hidden" in path.stem.lower() and "reveal" in path.stem.lower()
        ]
    )

    chosen = preferred[0] if preferred else None
    if not chosen:
        leftovers = sorted(
            [
                path
                for path in files
                if not re.match(r"^img[_-]?\d+", path.stem, re.IGNORECASE)
            ]
        )
        if leftovers:
            chosen = leftovers[0]

    if not chosen:
        return None

    return url_for("static", filename=f"images/memories/{chosen.name}")


def load_symbol_images() -> List[str]:
    """Load symbol_1..symbol_4 images from static/images/symbols with flexible naming/ext."""
    symbols_dir = Path(app.static_folder) / "images" / "symbols"
    symbols_dir.mkdir(parents=True, exist_ok=True)

    symbol_urls: List[str] = []
    files = [
        path
        for path in symbols_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    for idx in range(1, 5):
        match = next(
            (
                p
                for p in files
                if re.match(rf"^symbol[_-]?{idx}$", p.stem, re.IGNORECASE)
            ),
            None,
        )

        if match:
            symbol_urls.append(url_for("static", filename=f"images/symbols/{match.name}"))
        else:
            symbol_urls.append("")

    return symbol_urls


@app.route("/")
def index():
    image_urls = load_memory_images()
    hidden_reveal_image = load_hidden_reveal_image()
    symbol_urls = load_symbol_images()

    # Fallback placeholders when no photos are added yet.
    if not image_urls:
        image_urls = [
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1496843916299-590492c751f4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        ]

    data = {
        "name": "Sonu",
        "nickname": "sweetheart",
        "memories": image_urls,
        "captions": [
            "Our first long walk and nonstop laughter.",
            "The day we realized home can be a person.",
            "A tiny moment that somehow felt huge.",
            "Us, being us — soft chaos and comfort.",
            "Every photo, another reason to smile.",
        ],
        "story": [
            "Feels young, warm, and real.",
            "A year with you somehow feels both really fast and really full at the same time.",
            "Like we’ve had so many moments I’d never want to lose, but I still want way more of them.",
            "You make things lighter, funnier, and just better in ways I didn’t expect.",
            "I’m really lucky I got to spend this year with you.",
            "Happy anniversary, sweetheart.",
        ],
        "letter": (
            "Dear Sonu,\n\n"
            "This year with you has been my favorite chapter so far. "
            "Thank you for every laugh, every little check-in, and every memory. "
            "You make ordinary days feel magical.\n\n"
            "Happy 1 Year Anniversary.\n"
            "Love, always."
        ),
        "symbols": symbol_urls,
        "hidden_reveal": hidden_reveal_image,
    }

    return render_template("index.html", data=data)


if __name__ == "__main__":
    app.run(debug=True)
