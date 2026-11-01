import asyncio
import pytest

from apps.api.core.database import init_db


@pytest.fixture(scope="session", autouse=True)
def initialize_database_for_pytest():
    """Ensure database schema is created before running test suite on clean runners."""
    loop = asyncio.new_event_loop()
    loop.run_until_complete(init_db())
    loop.close()
