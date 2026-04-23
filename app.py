from __future__ import annotations

from pathlib import Path
import re
from typing import List

from flask import Flask, render_template, url_for

app = Flask(__name__, template_folder=".")

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
        "memory_captions": [
            "Honestly, this is the best <<how did you two meet>> story anyone could ask for. I still remember how we were just talking and laughing with your friends like we had known each other forever, even though we had just met. It was one of those experiences where everything felt so easy and right, and I knew I wanted to have a lot more moments like that with you.",
            "Again, in France because why not. This goofy picture reminds me how I almost made you one of the guys... like woah hey fratboy. Anyways, I'm glad you got to be part of all the memories I have of that trip, because I was quite nervous to go on this ten day trip with a group of people I didn't know well, but you made it so much fun and comfortable. I did definetely start to like you, especially towards the end... Anyways!",
            "Woah... by now we had already gotten together.. CRAZY! You ook so lost in this picture, but I think that's what makes it so cute. I remember we were just hanging out in kroger for whatever reason, and I was probably being a little too extra as usual, but you were just there for it and made me feel so comfortable being myself around you even this early on. This photo captures us being goofy and enjoying each other's company without any pressure or expectations.",
            "Woah... THE HOCO AHHHHH. What a night! I remember spending 2 hours randomly with Saanvi, right before, and then PRAYING that you would come right after so I didn't have to take the poster home. YOU were suchh a awkward little cutie, but honestly, I loved it. It was indeeed hilarious, and I will definetely tell others about that.",
            "Woah... you looked absolutely stunning in hoco btw. I remember how I was so nervous because I didn't know how to make corsettes or even knowing that's a thing until last moment. Getting flowers and all... yeah im sighing. However, I was so happy to be there with you, and this photo captures our cuteness maxing skills... mhmm!",
            "Woah... Why am I starting every caption with woah? Anyways, Starbucks! I parked my bike at some random pole, andd did not know what to get! It was chill because you weren't that big of a starbucks girl (good for me). I hope that we can have SOOOO many more of these random coffee runs together at Umichigan and... beyond!",
            "Woah... Lol I am just doing it for the funzies. These moments, when we finally get to hang out every two, sometimes four, sometimes one week, make my whole day, week.. until the sadness from you leaving once again takes over. But, I am proud of how far we have come, and how comfortable we now with each other. I hope we can have so many more of these, and that they can get longer and longer until we can finally be together all the time 😇",
            "This is one of our recent video calls, making the best of the distance. You make this demonic face (I kindly chose not to put that one instead for this book) and the hairr andd AHHHH ... hey pookie. Well uhm... yeah I actually wanted to more of these but... I want to keep some of the cuteness for myself. No, I think I want to keep this book around.. maybe even add to it as we grow. HMMMM... yeah.😇",
        ],
        "story": [
            "Feels young, warm, and real.",
            "A year with you somehow feels both really fast and really full at the same time.",
            "Like we’ve had so many moments I’d never want to lose, but I still want way more of them.",
            "You make things extra special, funnier, and just better in ways that no one else can.",
            "I’m really lucky I got to spend this year with you.",
            "Happy anniversary, sweetheart. I truly Love you, from the bottom of my heart.",
        ],
        "letter": (
            "Dear Sonu,\n\n"
            "This year with you has been my favorite chapter so far in life. "
            "Thank you for every laugh, every little check-in, "
            "and every memory we keep collecting together. "
            "Even the moments which you think I didn't enjoy like ice skating on our anniversary, "
            "even if it was only for about forty minutes, I love every moment spent with you, and the pain from the very uncomfortable shoes honestly disappeared when I held your hand. Eating free thanks to your "
            "very mysterious mafia-level connections was also a highlight ofcourse. "
            "I also love the little wooden box you made for me so much. "
            "The tiny rotating axle inside, with all those little photos taped around it, is one of the most "
            "thoughtful things anyone has ever made for me. Scrap that, it's in the most thoughtful things anyone has ever made for me, lol. "
            "Every time I scroll through it, it gives me a full rush of dopamine and this warm, steady feeling "
            "of love. And I do this every night before I change my clothes. "
            "You are truly special, and I feel so lucky to love you. "
            "You turned my worst days into the best ones.\n\n"
            "Happy 1 Year Anniversary.\n"
            "Live, Laugh, Love poo, as always."
        ),
        "symbols": symbol_urls,
        "hidden_reveal": hidden_reveal_image,
    }

    return render_template("index.html", data=data)


if __name__ == "__main__":
    app.run(debug=True)
