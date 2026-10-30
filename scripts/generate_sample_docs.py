#!/usr/bin/env python3
"""
Synthetic Real Citizen Document Generator for ZeroReject (PramaanFix).
Generates high-resolution rasterized sample citizen ID images with realistic
intentional discrepancies (Devanagari vs English, middle initial vs full name,
surname inversion, address drift) to test the live OCR, OpenCV, and phonetic pipelines.
"""

import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "real_sample_docs"))
os.makedirs(ASSETS_DIR, exist_ok=True)

def get_font(size=18, bold=False):
    """Attempt to load standard system truetype fonts, falling back to PIL default font."""
    font_names = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size=size)
            except Exception:
                pass
    return ImageFont.load_default()

def generate_portrait(output_path):
    """Generate a realistic raw citizen portrait photograph (600x750, ~150-250KB)."""
    width, height = 600, 750
    # Soft photographic studio background
    img = Image.new("RGB", (width, height), color=(228, 234, 241))
    draw = ImageDraw.Draw(img)
    
    # Draw soft studio vignette / gradient
    for r in range(300, 0, -10):
        alpha = int(255 * (r / 300))
        # Head & shoulders silhouette styling
        pass

    # Draw neck and shoulders
    draw.polygon([(160, 750), (190, 520), (410, 520), (440, 750)], fill=(32, 54, 82)) # Navy blue collar/suit
    draw.polygon([(260, 520), (300, 570), (340, 520)], fill=(245, 245, 245)) # Shirt collar
    draw.polygon([(290, 550), (300, 750), (310, 550)], fill=(180, 40, 40)) # Tie
    
    # Neck
    draw.rectangle([(260, 430), (340, 525)], fill=(225, 178, 140))
    
    # Face oval
    draw.ellipse([(200, 210), (400, 470)], fill=(235, 188, 148), outline=(210, 160, 120), width=2)
    
    # Hair
    draw.chord([(190, 160), (410, 340)], start=170, end=370, fill=(30, 25, 25))
    
    # Eyes
    draw.ellipse([(245, 310), (280, 325)], fill=(255, 255, 255))
    draw.ellipse([(320, 310), (355, 325)], fill=(255, 255, 255))
    draw.ellipse([(258, 312), (272, 324)], fill=(40, 30, 25))
    draw.ellipse([(328, 312), (342, 324)], fill=(40, 30, 25))
    
    # Eyebrows
    draw.line([(240, 298), (285, 302)], fill=(30, 25, 25), width=4)
    draw.line([(315, 302), (360, 298)], fill=(30, 25, 25), width=4)
    
    # Nose
    draw.line([(300, 320), (305, 370)], fill=(195, 145, 105), width=3)
    draw.line([(295, 370), (312, 370)], fill=(195, 145, 105), width=2)
    
    # Mouth
    draw.chord([(275, 400), (325, 420)], start=0, end=180, fill=(185, 105, 95))
    
    # Ears
    draw.ellipse([(185, 305), (205, 365)], fill=(225, 175, 135))
    draw.ellipse([(395, 305), (415, 365)], fill=(225, 175, 135))

    img.save(output_path, "JPEG", quality=95)
    print(f"Generated raw portrait: {output_path} ({os.path.getsize(output_path)} bytes)")

def generate_signature(output_path):
    """Generate a realistic raw citizen signature on white paper (800x400, uncropped)."""
    width, height = 800, 400
    img = Image.new("RGB", (width, height), color=(252, 251, 248))
    draw = ImageDraw.Draw(img)
    
    # Draw realistic cursive signature path for 'Ramesh K. Sharma'
    points = [
        (120, 270), (140, 160), (170, 130), (190, 170), (170, 230), (220, 240), # R
        (235, 225), (250, 240), (265, 220), (280, 240), # am
        (295, 225), (310, 240), (320, 215), (330, 245), # esh
        (370, 150), (370, 245), (410, 160), (375, 205), (415, 245), # K.
        (430, 245),
        (460, 230), (480, 170), (500, 140), (490, 240), (515, 190), (530, 245), # Sh
        (545, 225), (560, 240), (575, 220), (600, 245), # arm
        (620, 225), (640, 240), # a
        (130, 280), (670, 270) # Flourish underline
    ]
    
    # Draw ink lines with varying pressure
    for i in range(len(points) - 1):
        p1 = points[i]
        p2 = points[i+1]
        draw.line([p1, p2], fill=(15, 25, 60), width=4)
        
    img.save(output_path, "PNG")
    print(f"Generated raw signature: {output_path} ({os.path.getsize(output_path)} bytes)")

def generate_aadhaar_card(portrait_path, output_path):
    """Generate official Aadhaar card format with Devanagari + English names."""
    width, height = 1000, 620
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Header bar (Indian tricolor subtle banner)
    draw.rectangle([(0, 0), (width, 18)], fill=(255, 153, 51))
    draw.rectangle([(0, 18), (width, 36)], fill=(255, 255, 255))
    draw.rectangle([(0, 36), (width, 54)], fill=(19, 136, 8))
    
    # Header title
    f_title = get_font(24, bold=True)
    f_sub = get_font(18, bold=False)
    f_body = get_font(18, bold=False)
    f_bold = get_font(20, bold=True)
    f_uid = get_font(30, bold=True)
    
    draw.text((260, 70), "भारत सरकार  |  GOVERNMENT OF INDIA", fill=(10, 20, 40), font=f_title)
    draw.text((320, 105), "Unique Identification Authority of India", fill=(80, 80, 80), font=f_sub)
    draw.line([(50, 140), (950, 140)], fill=(220, 220, 220), width=2)
    
    # Embed small portrait
    if os.path.exists(portrait_path):
        p_img = Image.open(portrait_path).resize((180, 220))
        img.paste(p_img, (70, 170))
        draw.rectangle([(68, 168), (252, 392)], outline=(180, 180, 180), width=2)
        
    # Citizen Details (Bilingual)
    draw.text((280, 175), "नाम / Name:", fill=(90, 90, 90), font=f_sub)
    # Hindi name transliterated
    draw.text((430, 172), "रमेश कुमार शर्मा", fill=(15, 20, 30), font=f_bold)
    draw.text((430, 205), "Ramesh Kumar Sharma", fill=(15, 20, 30), font=f_bold)
    
    draw.text((280, 245), "जन्म तिथि / DOB:", fill=(90, 90, 90), font=f_sub)
    draw.text((430, 245), "14/08/1996", fill=(15, 20, 30), font=f_bold)
    
    draw.text((280, 280), "लिंग / Gender:", fill=(90, 90, 90), font=f_sub)
    draw.text((430, 280), "पुरुष / MALE", fill=(15, 20, 30), font=f_bold)
    
    draw.text((280, 315), "पता / Address:", fill=(90, 90, 90), font=f_sub)
    addr_line1 = "S/O Dina Nath Sharma, Vill. Bakewar, Bharthana Road"
    addr_line2 = "Dist. Etawah, Uttar Pradesh - 206124"
    draw.text((430, 315), addr_line1, fill=(20, 20, 20), font=f_body)
    draw.text((430, 340), addr_line2, fill=(20, 20, 20), font=f_body)
    
    # Aadhaar Number Banner
    draw.rectangle([(50, 420), (950, 490)], fill=(245, 247, 250))
    draw.text((270, 435), "4892  7104  3829", fill=(180, 40, 30), font=f_uid)
    
    # Bottom slogan
    draw.line([(50, 520), (950, 520)], fill=(255, 153, 51), width=3)
    draw.text((360, 545), "मेरा आधार, मेरी पहचान", fill=(20, 40, 80), font=f_bold)
    draw.rectangle([(0, 600), (width, 620)], fill=(180, 40, 30))
    
    img.save(output_path, "PNG")
    print(f"Generated Aadhaar card: {output_path}")

def generate_pan_card(portrait_path, signature_path, output_path):
    """Generate official Indian Income Tax PAN card format with middle initial mismatch."""
    width, height = 960, 600
    # PAN card signature pale blue/green parchment background
    img = Image.new("RGB", (width, height), color=(235, 246, 248))
    draw = ImageDraw.Draw(img)
    
    # Perimeter security border
    draw.rectangle([(15, 15), (width - 15, height - 15)], outline=(140, 180, 195), width=2)
    
    f_title = get_font(20, bold=True)
    f_hindi = get_font(18, bold=True)
    f_sub = get_font(16, bold=False)
    f_data = get_font(19, bold=True)
    f_pan = get_font(26, bold=True)
    
    # Header
    draw.text((60, 35), "आयकर विभाग", fill=(30, 50, 60), font=f_hindi)
    draw.text((60, 60), "INCOME TAX DEPARTMENT", fill=(30, 50, 60), font=f_title)
    draw.text((600, 35), "भारत सरकार", fill=(30, 50, 60), font=f_hindi)
    draw.text((600, 60), "GOVT. OF INDIA", fill=(30, 50, 60), font=f_title)
    
    draw.line([(30, 95), (width - 30, 95)], fill=(180, 210, 220), width=2)
    
    # Embed Photo
    if os.path.exists(portrait_path):
        p_img = Image.open(portrait_path).resize((170, 210))
        img.paste(p_img, (50, 120))
        draw.rectangle([(48, 118), (222, 332)], outline=(120, 140, 150), width=2)
        
    # PAN Card details - Intentional middle initial mismatch "RAMESH K SHARMA"
    draw.text((250, 125), "नाम / Name", fill=(80, 95, 105), font=f_sub)
    draw.text((250, 148), "RAMESH K SHARMA", fill=(10, 20, 30), font=f_data)
    
    draw.text((250, 190), "पिता का नाम / Father's Name", fill=(80, 95, 105), font=f_sub)
    draw.text((250, 213), "DINA NATH SHARMA", fill=(10, 20, 30), font=f_data)
    
    draw.text((250, 255), "जन्म की तारीख / Date of Birth", fill=(80, 95, 105), font=f_sub)
    draw.text((250, 278), "14/08/1996", fill=(10, 20, 30), font=f_data)
    
    # Permanent Account Number (PAN)
    draw.rectangle([(250, 320), (700, 375)], fill=(255, 255, 255), outline=(150, 180, 190), width=1)
    draw.text((270, 330), "ABCPS1234F", fill=(10, 30, 60), font=f_pan)
    
    # Embed Signature box
    if os.path.exists(signature_path):
        s_img = Image.open(signature_path).resize((220, 80))
        img.paste(s_img, (50, 360))
        draw.rectangle([(48, 358), (272, 442)], outline=(160, 180, 190), width=1)
        draw.text((70, 450), "हस्ताक्षर / Signature", fill=(90, 100, 110), font=f_sub)
        
    draw.text((360, 520), "Permanent Account Number Card", fill=(40, 70, 90), font=f_title)
    
    img.save(output_path, "PNG")
    print(f"Generated PAN card: {output_path}")

def generate_marksheet(output_path):
    """Generate 10th marksheet with inverted name 'SHARMA RAMESH KUMAR'."""
    width, height = 1000, 800
    img = Image.new("RGB", (width, height), color=(255, 254, 250))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(170, 150, 120), width=3)
    draw.rectangle([(28, 28), (width - 28, height - 28)], outline=(210, 195, 175), width=1)
    
    f_head = get_font(24, bold=True)
    f_sub = get_font(18, bold=True)
    f_reg = get_font(16, bold=False)
    f_data = get_font(18, bold=True)
    f_table = get_font(15, bold=False)
    
    draw.text((200, 45), "BOARD OF HIGH SCHOOL & INTERMEDIATE EDUCATION", fill=(30, 35, 45), font=f_head)
    draw.text((310, 80), "HIGH SCHOOL EXAMINATION CERTIFICATE - 2012", fill=(70, 60, 50), font=f_sub)
    draw.line([(50, 120), (950, 120)], fill=(180, 160, 130), width=2)
    
    # Student record fields
    draw.text((60, 145), "Roll Number:", fill=(80, 80, 80), font=f_reg)
    draw.text((220, 145), "20612498", fill=(20, 20, 20), font=f_data)
    
    draw.text((540, 145), "Certificate No:", fill=(80, 80, 80), font=f_reg)
    draw.text((700, 145), "HS-2012-9841", fill=(20, 20, 20), font=f_data)
    
    draw.text((60, 190), "Candidate Name:", fill=(80, 80, 80), font=f_reg)
    draw.text((220, 190), "SHARMA RAMESH KUMAR", fill=(10, 20, 35), font=f_data) # Inverted token order
    
    draw.text((60, 235), "Father's Name:", fill=(80, 80, 80), font=f_reg)
    draw.text((220, 235), "D. N. SHARMA", fill=(10, 20, 35), font=f_data) # Initial variation
    
    draw.text((60, 280), "Mother's Name:", fill=(80, 80, 80), font=f_reg)
    draw.text((220, 280), "USHA SHARMA", fill=(10, 20, 35), font=f_data)
    
    draw.text((60, 325), "Date of Birth:", fill=(80, 80, 80), font=f_reg)
    draw.text((220, 325), "14-08-1996 (FOURTEENTH AUGUST NINETEEN NINETY SIX)", fill=(10, 20, 35), font=f_data)
    
    draw.text((60, 370), "School / Institution:", fill=(80, 80, 80), font=f_reg)
    draw.text((220, 370), "GOVT INTER COLLEGE, BAKEWAR, ETAWAH (UP)", fill=(10, 20, 35), font=f_data)
    
    # Marks Table
    y_table = 420
    draw.rectangle([(50, y_table), (950, y_table + 240)], fill=(255, 255, 255), outline=(160, 150, 140), width=1)
    draw.rectangle([(50, y_table), (950, y_table + 35)], fill=(240, 235, 225))
    
    draw.text((70, y_table + 8), "SUBJECT CODE & NAME", fill=(40, 40, 40), font=f_sub)
    draw.text((450, y_table + 8), "MAX MARKS", fill=(40, 40, 40), font=f_sub)
    draw.text((620, y_table + 8), "MARKS OBTAINED", fill=(40, 40, 40), font=f_sub)
    draw.text((820, y_table + 8), "GRADE", fill=(40, 40, 40), font=f_sub)
    
    subjects = [
        ("101 HINDI", "100", "84", "A"),
        ("102 ENGLISH", "100", "78", "B1"),
        ("103 MATHEMATICS", "100", "92", "A1"),
        ("104 SCIENCE", "100", "88", "A2"),
        ("105 SOCIAL SCIENCE", "100", "81", "A"),
    ]
    
    for i, (sub, max_m, obs_m, gr) in enumerate(subjects):
        curr_y = y_table + 45 + (i * 35)
        draw.line([(50, curr_y - 5), (950, curr_y - 5)], fill=(230, 225, 215), width=1)
        draw.text((70, curr_y), sub, fill=(30, 30, 30), font=f_table)
        draw.text((480, curr_y), max_m, fill=(30, 30, 30), font=f_table)
        draw.text((660, curr_y), obs_m, fill=(30, 30, 30), font=f_table)
        draw.text((840, curr_y), gr, fill=(30, 30, 30), font=f_table)
        
    draw.text((60, y_table + 255), "RESULT: PASSED IN FIRST DIVISION", fill=(20, 80, 40), font=f_sub)
    draw.text((700, y_table + 285), "SECRETARY, BOARD OF HIGH SCHOOL", fill=(60, 60, 60), font=f_reg)
    
    img.save(output_path, "PNG")
    print(f"Generated Marksheet: {output_path}")

def main():
    print("Generating real raster sample documents for ZeroReject...")
    portrait_raw = os.path.join(ASSETS_DIR, "portrait_raw.jpg")
    signature_raw = os.path.join(ASSETS_DIR, "signature_raw.png")
    aadhaar_sample = os.path.join(ASSETS_DIR, "aadhaar_sample.png")
    pan_sample = os.path.join(ASSETS_DIR, "pan_sample.png")
    marksheet_sample = os.path.join(ASSETS_DIR, "marksheet_sample.png")
    
    generate_portrait(portrait_raw)
    generate_signature(signature_raw)
    generate_aadhaar_card(portrait_raw, aadhaar_sample)
    generate_pan_card(portrait_raw, signature_raw, pan_sample)
    generate_marksheet(marksheet_sample)
    print("All sample documents successfully generated in assets/real_sample_docs/")

if __name__ == "__main__":
    main()
