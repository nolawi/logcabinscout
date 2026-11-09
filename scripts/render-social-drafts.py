"""Render property-photo draft cards from embedded images, without browser network requests or publishing."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parent.parent
output = root / 'artifacts' / 'instagram'
manifest = json.loads((output / 'manifest.json').read_text())
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or None, headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1080, 'height': 1350}, device_scale_factor=1)
    page.route('**/*', lambda route: route.abort())
    for index, draft in enumerate(manifest['drafts'], 1):
        page.set_content((output / f'draft-{index}.html').read_text(), wait_until='load')
        assert page.locator('.photo img').evaluate('(img)=>img.complete && img.naturalWidth > 0'), 'Property image failed to load'
        assert page.locator('.main').evaluate('(el)=>el.getBoundingClientRect().bottom') <= page.locator('footer').bounding_box()['y'], 'Draft text overlaps footer'
        page.screenshot(path=str(output / f'draft-{index}.png'))
        page.screenshot(path=str(output / f'draft-{index}.jpg'), type='jpeg', quality=92)
    browser.close()
print(f"Rendered {len(manifest['drafts'])} draft PNGs; nothing published.")
