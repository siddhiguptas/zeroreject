import time
from fastapi import APIRouter, HTTPException, Query

from apps.api.schemas.contracts import PostalValidationResult
from apps.api.services.phonetic_reconciler import phonetic_reconciler

router = APIRouter(prefix="/api/jurisdiction", tags=["India Post & Local Government Directory (LGD) Jurisdiction"])


@router.get("/verify", response_model=PostalValidationResult)
async def verify_jurisdiction_pincode(
    pin: str = Query(..., description="6-digit Indian Postal PIN code")
):
    """
    Live India Post & LGD Administrative Jurisdiction Verifier.
    Strictly validates 6-digit numeric input, queries authoritative LGD dataset,
    and performs live lookup against api.postalpincode.in.
    Never fabricates or returns hardcoded fallback results.
    """
    clean = pin.strip()
    if not clean.isdigit() or len(clean) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid PIN code format. Indian PIN codes must be strictly 6 digits."
        )

    result = await phonetic_reconciler.validate_pincode_live(clean)
    return result

