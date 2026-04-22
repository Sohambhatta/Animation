# Anniversary Scrapbook (Flask + HTML/CSS/JS)

An interactive, animated 1-year anniversary experience featuring:
- **Scrapbook with 7-page spread** + 8 memory images
- **Page-flip animations** pivoting from center spine (instant, 0.55s smooth transition)
- **Soft-physics bouncing hearts** with collision detection & glow
- **Shimmer effect** on story text (gold band moving left-to-right)
- **Desk scene transition** - book fades away, appears on desk
- **Interactive envelope** - opens with 3D flip, reveals letter & expandable card
- **Final black scene** with floating decorative symbols & bouncing hearts
- **Responsive design** with parallax, sparkles, & micro-interactions

## Project Structure

```
app.py
templates/
  index.html
static/
  css/
    styles.css
  js/
    main.js
  images/
    memories/        ← Add IMG_1 through IMG_8 here
    symbols/         ← Add symbol1.png through symbol4.png here
  audio/
    bg-music.mp3     (optional - auto-plays)
    page-flip.mp3    (optional - plays on flip)
```

## Quick Start

1. Create and activate a Python virtual environment.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run:
   ```
   python app.py
   ```
4. Open:
   ```
   http://127.0.0.1:5000
   ```

## Add Memory Images (8 total)

Place images in: `static/images/memories/`

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

**Page Layout:**
- **IMG_1, IMG_2** → Page 1: "Our little memories"
- **IMG_3, IMG_4** → Page 2: "More us, more smiles"
- **IMG_5, IMG_6** → Page 3: "Moments we treasure"
- **IMG_7, IMG_8** → Page 4: "Every day with you"

Each image displays as a square (1:1 aspect ratio) with soft scrapbook styling.

## Add Symbol Images (4 total)

Place decorative images in: `static/images/symbols/`

- **symbol1.png** - Appears on intro page (mirrored on left & right sides)
- **symbol2.png** - Floats in final black scene
- **symbol3.png** - Floats in final black scene
- **symbol4.png** - Floats in final black scene

## Customize Text

Edit values in [app.py](app.py):

```python
data = {
    'name': 'Sonu',              # Main name shown on intro
    'nickname': 'sweetheart',    # Pet name used in story
    'captions': [                # Rotate across memory pages
        "Our little memories",
        "More us, more smiles",
        "Moments we treasure",
        "Every day with you",
        "Forever with you"
    ],
    'story': [                   # Story page lines (left side)
        "A year ago, I met you.",
        "And my world changed.",
        "Every moment since...",
        "...has been magic."
    ],
    'letter': "Happy one year! ..."  # Envelope message
}
```

## Optional Audio

Add audio files for enhanced experience:

- **`static/audio/bg-music.mp3`** - Background ambient music (auto-loops)
- **`static/audio/page-flip.mp3`** - Sound effect when flipping pages

If files are missing, the app continues to work with Web Audio API fallback (auto-generated ambient tone).

## Page-by-Page Flow

1. **Intro Page** - "Happy Anniversary" + symbol 1 (mirrored)
2. **Memory Page 1** - 2 images + rotating caption
3. **Memory Page 2** - 2 images + rotating caption
4. **Memory Page 3** - 2 images + rotating caption
5. **Memory Page 4** - 2 images + rotating caption
6. **Story Page** (left) + **Almost Page** (right backface)
   - Story typewriter with shimmer effect
   - "Almost Lost You" reflection page on back
7. **Hidden Moment** - Press & hold anywhere to reveal
8. **→ Desk Scene** - Book closes, settles on desk
9. **→ Envelope Scene** - Click anywhere to open letter, card slides out
10. **→ Final Black Scene** - Symbols 2,3,4 float + hearts bounce

## Interactive Elements

- **Left/Right of book** - Click to flip pages (or use arrow keys / swipe on mobile)
- **Anywhere on page** - Click to spawn sparkles ✨
- **Music/SFX buttons** - Toggle at bottom (fallback synthesis if files missing)
- **Envelope** - Click to open with 3D flip animation
- **Card slider** - Expands to show full message
- **Page indicator** - Shows current page at bottom

## Technical Features

- **Instant page visibility** - No pre-flip lag or backface flashing
- **Center spine pivot** - Pages rotate from middle, not left edge
- **Soft physics hearts** - Bounce, collide with edges & each other, glow when near
- **Gold shimmer** - Moves across story text (5-7 character band)
- **GSAP transitions** - Smooth scene fade-in/out between book → desk → letter → final
- **Parallax** - Pages tilt slightly with mouse movement
- **Floating "Sonu" text** - Random name floats up from bottom
- **Web Audio fallback** - Generates ambient tone if mp3 files missing

## Adjust Animation Speeds

Edit [static/css/styles.css](static/css/styles.css):

- **Page flip duration** - Search `0.55s`, change to slower/faster (e.g., `0.7s`, `0.4s`)
- **Heart count** - Search `HEART_COUNT` in [static/js/main.js](static/js/main.js) (default: 14)
- **Shimmer band size** - Search `shimmerGradient` in JS, adjust color stop positions
- **Final scene symbol speed** - Search `floatingSymbol` animation duration in CSS

---

Made with love for a soft, magical anniversary experience 🎀✨
