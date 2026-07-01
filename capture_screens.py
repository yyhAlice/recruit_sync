from playwright.sync_api import sync_playwright
import os, time

BASE = "http://localhost:4600/ui_design"
OUT  = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(OUT, exist_ok=True)

SCREENS = [
    ("login",            None),
    ("dashboard",        "showApp(); showScreen('dashboard');"),
    ("clients",          "showApp(); showScreen('clients');"),
    ("client-detail",    "showApp(); showScreen('client-detail');"),
    ("jobs",             "showApp(); showScreen('jobs');"),
    ("job-detail",       "showApp(); showScreen('job-detail');"),
    ("pipeline",         "showApp(); showScreen('pipeline');"),
    ("candidates",       "showApp(); showScreen('candidates');"),
    ("candidate-profile","showApp(); showScreen('candidate-profile');"),
    ("upload-cv",        "showApp(); showScreen('upload-cv');"),
    ("cv-review",        "showApp(); showScreen('cv-review');"),
    ("cv-template",      "showApp(); showScreen('cv-template');"),
    ("cv-download",      "showApp(); showScreen('cv-download');"),
    ("activity",         "showApp(); showScreen('activity');"),
    ("reminders",        "showApp(); showScreen('reminders');"),
    ("files-root",       "showApp(); showScreen('files'); showFWRoot();"),
    ("files-entity",     "showApp(); showScreen('files'); showFWEntity();"),
    ("files-folder",     "showApp(); showScreen('files'); showFWFolder();"),
    ("onboarding",       "showApp(); showScreen('onboarding');"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 820})

    for name, js in SCREENS:
        page.goto(BASE, wait_until="networkidle")
        if js:
            page.evaluate(js)
        page.wait_for_timeout(400)
        path = os.path.join(OUT, f"{name}.png")
        page.screenshot(path=path, full_page=False)
        print(f"  OK {name}")

    browser.close()
    print(f"\nDone — screenshots in: {OUT}")
