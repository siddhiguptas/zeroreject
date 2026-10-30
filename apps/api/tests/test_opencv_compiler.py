import os
import pytest
from PIL import Image
from apps.api.services.opencv_compiler import opencv_compiler
from apps.api.core.config import settings

def test_signature_compilation_and_byte_ceiling(tmp_path):
    # Create an oversized mock raw signature (600x300, ~150KB)
    raw_sig_path = str(tmp_path / "test_raw_sig.png")
    img = Image.new("RGB", (600, 300), color=(255, 255, 255))
    # Draw dark strokes
    for x in range(50, 550, 2):
        for y in range(100, 200, 4):
            img.putpixel((x, y), (20, 30, 80))
    img.save(raw_sig_path, "PNG")

    compiled = opencv_compiler.compile_asset(
        input_path=raw_sig_path,
        asset_type="signature",
        session_id="test_session_sig"
    )

    assert os.path.exists(compiled["output_path"])
    assert compiled["width_px"] == 140
    assert compiled["height_px"] == 60
    # Signature ceiling: must be <= 20,480 bytes (20 KB)
    assert compiled["file_size_bytes"] <= 20480
    assert compiled["file_size_bytes"] >= 5120 # >= 5 KB
    assert compiled["compliant"] is True

def test_portrait_compilation(tmp_path):
    raw_portrait_path = str(tmp_path / "test_raw_portrait.jpg")
    img = Image.new("RGB", (800, 1000), color=(200, 220, 240))
    img.save(raw_portrait_path, "JPEG", quality=95)

    compiled = opencv_compiler.compile_asset(
        input_path=raw_portrait_path,
        asset_type="portrait",
        session_id="test_session_portrait"
    )

    assert os.path.exists(compiled["output_path"])
    assert compiled["width_px"] == 200
    assert compiled["height_px"] == 230
    assert compiled["file_size_bytes"] <= 51200 # <= 50 KB
    assert compiled["compliant"] is True

