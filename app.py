from __future__ import annotations

from pathlib import Path
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
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        ]
    )

    return [url_for("static", filename=f"images/memories/{file.name}") for file in files]


@app.route("/")
def index():
    image_urls = load_memory_images()

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
        "symbols": [
            url_for("static", filename="images/symbols/symbol1.png"),
            url_for("static", filename="images/symbols/symbol2.png"),
            url_for("static", filename="images/symbols/symbol3.png"),
            url_for("static", filename="images/symbols/symbol4.png"),
        ],
    }

    return render_template("index.html", data=data)


if __name__ == "__main__":
    app.run(debug=True)
