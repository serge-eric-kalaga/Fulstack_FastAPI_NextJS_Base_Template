"""
contain all the test for the applications
"""

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.test"))

log_dir = f"{os.getcwd()}/logs/app.log"
static_dir = f"{os.getcwd()}/static"
fake_dir = f"{os.getcwd()}/static/fake"
if not os.path.exists(static_dir):
    os.makedirs(f"{os.getcwd()}/static")
if not os.path.exists(log_dir):
    os.makedirs(f"{os.getcwd()}/logs", exist_ok=True)
    with open(log_dir, "w") as f:
        f.write("")
if not os.path.exists(fake_dir):
    os.makedirs(f"{os.getcwd()}/static/fake")
