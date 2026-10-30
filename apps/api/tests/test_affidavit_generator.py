import os
from apps.api.services.affidavit_generator import affidavit_generator

def test_generate_statutory_affidavit():
    result = affidavit_generator.generate_affidavit(
        session_id="test_affidavit_session",
        applicant_name_aadhaar="Ramesh Kumar Sharma",
        applicant_name_secondary="RAMESH K SHARMA",
        father_name="Dina Nath Sharma",
        dob="14/08/1996",
        address="Vill. Bakewar, Bharthana Road, Dist. Etawah, Uttar Pradesh - 206124",
        id_numbers={"aadhaar": "4892 7104 3829", "secondary": "ABCPS1234F"},
        citations=[
            {
                "statute": "Passport Seva Document Advisor Matrix (Annexure 'E')",
                "clause": "Rule 4(b) - Minor name variations and initials expansion curable by self-declaration."
            }
        ]
    )

    assert os.path.exists(result["output_path"])
    assert result["compliant"] is True
    assert result["file_size_bytes"] < 102400 # under 100 KB
    
    # Read binary header
    with open(result["output_path"], "rb") as f:
        header = f.read(8)
        assert header.startswith(b"%PDF-1.")

