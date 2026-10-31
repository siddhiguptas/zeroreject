"""
ZeroReject (PramaanFix) — Brand Asset & Icon Generation Pipeline
Generates SVG vector seals, multi-resolution favicons, PWA icons, and OpenGraph social cards
adhering to the Sovereign Archival & Precision Seal brand identity.
"""

import math
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Root directories
ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_PUBLIC_DIR = ROOT_DIR / "apps" / "web" / "public"
DOCS_ASSETS_DIR = ROOT_DIR / "docs" / "assets"

WEB_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
DOCS_ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Brand Color Palette (Sovereign Archival)
NAVY_DEEP = "#0E1A2B"
NAVY_ASHOKA = "#162A45"
NAVY_LIGHT = "#233D60"
VERMILION = "#C93B2B"
VERMILION_DARK = "#A82A1C"
GOLD_SEAL = "#D4AF37"
GOLD_MUTED = "#C5A059"
ALABASTER = "#F6F4EE"
ALABASTER_LIGHT = "#FAF9F5"
MUTED_SLATE = "#64748B"
BORDER_HAIRLINE = "#E2DFD2"

NAVY_RGB = (22, 42, 69)
NAVY_DEEP_RGB = (14, 26, 43)
VERMILION_RGB = (201, 59, 43)
GOLD_RGB = (212, 175, 55)
ALABASTER_RGB = (246, 244, 238)
ALABASTER_LIGHT_RGB = (250, 249, 245)
SLATE_RGB = (100, 116, 139)


def get_hex_points(cx: float, cy: float, radius: float) -> list[tuple[float, float]]:
    """Calculates points for a pointy-topped regular hexagon."""
    points = []
    for i in range(6):
        angle = math.radians(60 * i - 30)
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        points.append((x, y))
    return points


def generate_seal_svg(size: int = 512, standalone: bool = True) -> str:
    """Generates the Sovereign Hexagonal Seal SVG markup."""
    cx, cy = size / 2, size / 2
    r_outer = size * 0.44
    r_inner = size * 0.38
    r_core = size * 0.32

    outer_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in get_hex_points(cx, cy, r_outer))
    inner_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in get_hex_points(cx, cy, r_inner))
    core_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in get_hex_points(cx, cy, r_core))

    svg_content = f"""<g id="sovereign-seal" transform="translate(0, 0)">
  <!-- Outer Guilloché Rim -->
  <polygon points="{outer_pts}" fill="{NAVY_DEEP}" stroke="{GOLD_SEAL}" stroke-width="{size * 0.012}" stroke-linejoin="round" />
  <polygon points="{inner_pts}" fill="{NAVY_ASHOKA}" stroke="{GOLD_MUTED}" stroke-width="{size * 0.006}" stroke-dasharray="{size * 0.015},{size * 0.01}" />
  <polygon points="{core_pts}" fill="{NAVY_DEEP}" />

  <!-- Document Fold Geometry (Upper Right) -->
  <path d="M {cx - size * 0.16} {cy - size * 0.18}
           L {cx + size * 0.08} {cy - size * 0.18}
           L {cx + size * 0.18} {cy - size * 0.08}
           L {cx + size * 0.18} {cy + size * 0.18}
           L {cx - size * 0.16} {cy + size * 0.18} Z"
        fill="none" stroke="{ALABASTER}" stroke-width="{size * 0.018}" stroke-linejoin="round" />
  
  <!-- Fold Corner Ear -->
  <path d="M {cx + size * 0.08} {cy - size * 0.18}
           L {cx + size * 0.08} {cy - size * 0.08}
           L {cx + size * 0.18} {cy - size * 0.08} Z"
        fill="{GOLD_SEAL}" stroke="{GOLD_SEAL}" stroke-width="{size * 0.008}" stroke-linejoin="round" />

  <!-- Indic Phonetic Equivalence Wave (≈) -->
  <path d="M {cx - size * 0.10} {cy - size * 0.04}
           Q {cx - size * 0.05} {cy - size * 0.07}, {cx} {cy - size * 0.04}
           T {cx + size * 0.10} {cy - size * 0.04}"
        fill="none" stroke="{GOLD_MUTED}" stroke-width="{size * 0.02}" stroke-linecap="round" />
  <path d="M {cx - size * 0.10} {cy + size * 0.02}
           Q {cx - size * 0.05} {cy - size * 0.01}, {cx} {cy + size * 0.02}
           T {cx + size * 0.10} {cy + size * 0.02}"
        fill="none" stroke="{GOLD_MUTED}" stroke-width="{size * 0.02}" stroke-linecap="round" />

  <!-- Vermilion Wax Seal Badge with Checkmark -->
  <circle cx="{cx + size * 0.12}" cy="{cy + size * 0.12}" r="{size * 0.11}" fill="{VERMILION}" stroke="{ALABASTER}" stroke-width="{size * 0.015}" />
  <path d="M {cx + size * 0.06} {cy + size * 0.12}
           L {cx + size * 0.10} {cy + size * 0.16}
           L {cx + size * 0.18} {cy + size * 0.08}"
        fill="none" stroke="{ALABASTER}" stroke-width="{size * 0.02}" stroke-linecap="round" stroke-linejoin="round" />
</g>"""

    if standalone:
        return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
{svg_content}
</svg>"""
    return svg_content


def generate_horizontal_logo_svg(width: int = 800, height: int = 200) -> str:
    """Generates the full horizontal banner logo SVG for hero headers & docs."""
    seal_size = 140
    seal_x = 35
    seal_y = (height - seal_size) / 2

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;family=Inter:wght@400;500;600&amp;display=swap');
      .title {{
        font-family: 'Cinzel', 'Times New Roman', Georgia, serif;
        font-weight: 700;
        font-size: 52px;
        fill: {NAVY_ASHOKA};
        letter-spacing: -0.5px;
      }}
      .title-accent {{
        fill: {VERMILION};
      }}
      .badge-bg {{
        fill: {NAVY_DEEP};
        rx: 4px;
      }}
      .badge-text {{
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 15px;
        fill: {GOLD_SEAL};
        letter-spacing: 2.5px;
      }}
      .subtitle {{
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 500;
        font-size: 14px;
        fill: {MUTED_SLATE};
        letter-spacing: 0.2px;
      }}
      .border-line {{
        stroke: {BORDER_HAIRLINE};
        stroke-width: 1px;
      }}
    </style>
  </defs>

  <!-- Background subtle warm archival base -->
  <rect width="{width}" height="{height}" fill="{ALABASTER_LIGHT}" rx="12" />
  <rect x="0.5" y="0.5" width="{width - 1}" height="{height - 1}" fill="none" stroke="{BORDER_HAIRLINE}" rx="12" />

  <!-- Sovereign Seal Component -->
  <g transform="translate({seal_x}, {seal_y})">
    {generate_seal_svg(size=seal_size, standalone=False)}
  </g>

  <!-- Typography Block -->
  <g transform="translate(195, 78)">
    <text class="title" x="0" y="0">Zero<tspan class="title-accent">Reject</tspan></text>
    
    <!-- Monospace Hindi/Sanskrit Transliteration Badge -->
    <rect class="badge-bg" x="325" y="-36" width="168" height="34" />
    <text class="badge-text" x="337" y="-13">PRAMAAN·FIX</text>

    <!-- Subtitle / Mission Tagline -->
    <text class="subtitle" x="2" y="32">Autonomous Pre-Flight Cross-Document Mismatch Reconciler</text>
    <text class="subtitle" x="2" y="52">&amp; Self-Healing Digital Bureaucracy Engine</text>
  </g>

  <!-- Gold Sovereign Accent Ribbon -->
  <line x1="195" y1="145" x2="750" y2="145" stroke="{GOLD_SEAL}" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6" />
</svg>"""


def generate_scalable_favicon_svg() -> str:
    """Generates vector favicon supporting dark/light mode."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <style>
      :root {{
        --bg-color: {NAVY_DEEP};
        --gold-color: {GOLD_SEAL};
        --vermilion-color: {VERMILION};
        --white-color: {ALABASTER};
      }}
      @media (prefers-color-scheme: light) {{
        :root {{
          --bg-color: {NAVY_ASHOKA};
        }}
      }}
    </style>
  </defs>
  <!-- Hexagon -->
  <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="var(--bg-color)" stroke="var(--gold-color)" stroke-width="2.5" stroke-linejoin="round" />
  
  <!-- Document Fold -->
  <path d="M 22 20 L 38 20 L 44 26 L 44 44 L 22 44 Z" fill="none" stroke="var(--white-color)" stroke-width="2" stroke-linejoin="round" />
  <path d="M 38 20 L 38 26 L 44 26 Z" fill="var(--gold-color)" />
  
  <!-- Checkmark Badge -->
  <circle cx="42" cy="42" r="9" fill="var(--vermilion-color)" stroke="var(--white-color)" stroke-width="1.5" />
  <path d="M 38 42 L 41 45 L 46 39" fill="none" stroke="var(--white-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>"""


def render_raster_icon(size: int) -> Image.Image:
    """Renders high-res raster icon of the Sovereign Seal with PIL."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size / 2, size / 2
    r_outer = size * 0.44
    r_inner = size * 0.38
    r_core = size * 0.32

    # Draw Outer Hexagon
    outer_pts = get_hex_points(cx, cy, r_outer)
    draw.polygon(outer_pts, fill=NAVY_DEEP_RGB, outline=GOLD_RGB, width=max(1, int(size * 0.015)))

    # Draw Inner Hexagon
    inner_pts = get_hex_points(cx, cy, r_inner)
    draw.polygon(inner_pts, fill=NAVY_RGB, outline=GOLD_RGB, width=max(1, int(size * 0.008)))

    # Core Hexagon
    core_pts = get_hex_points(cx, cy, r_core)
    draw.polygon(core_pts, fill=NAVY_DEEP_RGB)

    # Document Fold Box
    stroke_w = max(2, int(size * 0.02))
    p1 = (cx - size * 0.16, cy - size * 0.18)
    p2 = (cx + size * 0.08, cy - size * 0.18)
    p3 = (cx + size * 0.18, cy - size * 0.08)
    p4 = (cx + size * 0.18, cy + size * 0.18)
    p5 = (cx - size * 0.16, cy + size * 0.18)

    draw.line([p1, p2, p3, p4, p5, p1], fill=ALABASTER_RGB, width=stroke_w, joint="curve")

    # Corner Ear Fill
    ear_pts = [p2, (cx + size * 0.08, cy - size * 0.08), p3]
    draw.polygon(ear_pts, fill=GOLD_RGB, outline=GOLD_RGB)

    # Equivalence Wave Bars (Approx with lines)
    bar_y1 = cy - size * 0.04
    bar_y2 = cy + size * 0.03
    draw.line([(cx - size * 0.10, bar_y1), (cx + size * 0.10, bar_y1)], fill=GOLD_RGB, width=max(2, int(size * 0.018)))
    draw.line([(cx - size * 0.10, bar_y2), (cx + size * 0.10, bar_y2)], fill=GOLD_RGB, width=max(2, int(size * 0.018)))

    # Vermilion Wax Seal Circle
    badge_cx = cx + size * 0.12
    badge_cy = cy + size * 0.12
    badge_r = size * 0.11

    draw.ellipse(
        [badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r],
        fill=VERMILION_RGB,
        outline=ALABASTER_RGB,
        width=max(1, int(size * 0.016)),
    )

    # Checkmark inside badge
    chk_p1 = (badge_cx - badge_r * 0.5, badge_cy)
    chk_p2 = (badge_cx - badge_r * 0.1, badge_cy + badge_r * 0.45)
    chk_p3 = (badge_cx + badge_r * 0.55, badge_cy - badge_r * 0.35)
    draw.line([chk_p1, chk_p2, chk_p3], fill=ALABASTER_RGB, width=max(2, int(size * 0.022)), joint="curve")

    return img


def generate_og_image(width: int = 1200, height: int = 630) -> Image.Image:
    """Generates the 1200x630 OpenGraph card with Sovereign Archival design."""
    img = Image.new("RGBA", (width, height), ALABASTER_LIGHT_RGB)
    draw = ImageDraw.Draw(img)

    # Frame border
    draw.rectangle([0, 0, width - 1, height - 1], outline=(226, 223, 210), width=3)
    draw.rectangle([16, 16, width - 17, height - 17], outline=NAVY_DEEP_RGB, width=2)

    # Draw Sovereign Seal on Left
    seal_size = 280
    seal_img = render_raster_icon(seal_size)
    img.paste(seal_img, (70, (height - seal_size) // 2), seal_img)

    # Right Content Area
    tx = 400
    ty = 130

    # Monospace Brand Header
    draw.rectangle([tx, ty, tx + 240, ty + 36], fill=NAVY_DEEP_RGB)
    # Draw simple text with fallback font
    try:
        font_serif = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 68)
        font_mono = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 18)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
        font_pill = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 16)
    except Exception:
        font_serif = ImageFont.load_default()
        font_mono = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_pill = ImageFont.load_default()

    draw.text((tx + 18, ty + 8), "PRAMAAN·FIX | FORGE '26", fill=GOLD_RGB, font=font_mono)

    # Title: ZeroReject
    draw.text((tx, ty + 50), "Zero", fill=NAVY_DEEP_RGB, font=font_serif)
    # Estimate width of "Zero"
    zero_bbox = draw.textbbox((tx, ty + 50), "Zero", font=font_serif)
    reject_x = zero_bbox[2] + 4
    draw.text((reject_x, ty + 50), "Reject", fill=VERMILION_RGB, font=font_serif)

    # Tagline
    draw.text(
        (tx, ty + 140),
        "Pre-Flight Cross-Document Mismatch Reconciler\n& Self-Healing Digital Bureaucracy Agent",
        fill=NAVY_RGB,
        font=font_sub,
    )

    # Gold Divider
    draw.line([(tx, ty + 230), (tx + 720, ty + 230)], fill=GOLD_RGB, width=3)

    # 3 Architecture Feature Pills
    pills = [
        ("Indic Phonetic Graph", "Double Metaphone + Jaro-Winkler"),
        ("Adaptive OpenCV Compiler", "100% Deterministic Byte Fit"),
        ("Self-Healing Playwright", "State Machine + 502 Rollback"),
    ]

    pill_y = ty + 260
    pill_x = tx
    for title, subtitle in pills:
        draw.rectangle([pill_x, pill_y, pill_x + 225, pill_y + 90], fill=NAVY_DEEP_RGB, outline=GOLD_RGB, width=1)
        draw.text((pill_x + 14, pill_y + 16), title, fill=ALABASTER_RGB, font=font_pill)
        draw.text((pill_x + 14, pill_y + 44), subtitle, fill=SLATE_RGB, font=font_mono)
        pill_x += 245

    # Bottom track stamp
    draw.text(
        (tx, height - 70),
        "Track 1: Civic Pulse, Digital Governance & Public Information • 100% Free AI Stack",
        fill=SLATE_RGB,
        font=font_mono,
    )

    return img


def main():
    print("🎨 Generating ZeroReject (PramaanFix) Brand & Icon Assets...")

    # 1. Full Horizontal Logo Banner SVG
    banner_svg = generate_horizontal_logo_svg(800, 200)
    (WEB_PUBLIC_DIR / "logo.svg").write_text(banner_svg, encoding="utf-8")
    (DOCS_ASSETS_DIR / "logo-banner.svg").write_text(banner_svg, encoding="utf-8")
    print("  ✓ logo.svg & logo-banner.svg generated (800x200)")

    # 2. Square Vector Seal (512x512)
    seal_svg = generate_seal_svg(512, standalone=True)
    (WEB_PUBLIC_DIR / "logo-mark.svg").write_text(seal_svg, encoding="utf-8")
    (DOCS_ASSETS_DIR / "logo-mark.svg").write_text(seal_svg, encoding="utf-8")
    print("  ✓ logo-mark.svg generated (512x512)")

    # 3. Scalable Vector Favicon (icon.svg)
    fav_svg = generate_scalable_favicon_svg()
    (WEB_PUBLIC_DIR / "icon.svg").write_text(fav_svg, encoding="utf-8")
    print("  ✓ icon.svg generated")

    # 4. Multi-Resolution Favicon (.ico)
    ico_img_16 = render_raster_icon(16)
    ico_img_32 = render_raster_icon(32)
    ico_img_48 = render_raster_icon(48)
    ico_img_48.save(
        WEB_PUBLIC_DIR / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[ico_img_16, ico_img_32],
    )
    print("  ✓ favicon.ico generated (16x16, 32x32, 48x48)")

    # 5. Apple Touch Icon & PWA Icons
    apple_icon = render_raster_icon(180)
    apple_icon.save(WEB_PUBLIC_DIR / "apple-touch-icon.png", format="PNG")
    print("  ✓ apple-touch-icon.png generated (180x180)")

    pwa_192 = render_raster_icon(192)
    pwa_192.save(WEB_PUBLIC_DIR / "icon-192.png", format="PNG")
    print("  ✓ icon-192.png generated (192x192)")

    pwa_512 = render_raster_icon(512)
    pwa_512.save(WEB_PUBLIC_DIR / "icon-512.png", format="PNG")
    print("  ✓ icon-512.png generated (512x512)")

    # 6. OpenGraph Social Preview Card (1200x630)
    og_img = generate_og_image(1200, 630)
    og_img.convert("RGB").save(WEB_PUBLIC_DIR / "og-image.png", format="PNG", quality=95)
    print("  ✓ og-image.png generated (1200x630)")

    print("✨ All brand and icon assets successfully generated!")


if __name__ == "__main__":
    main()
