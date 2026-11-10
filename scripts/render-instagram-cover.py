"""Render the original property photograph with only location and price added."""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
html_path, output_path = sys.argv[1:]
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or None, headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 1400}, device_scale_factor=1)
    page.route('**/*', lambda route: route.abort())
    page.set_content(Path(html_path).read_text(), wait_until='load')
    assert page.locator('img').evaluate('(img)=>img.complete && img.naturalWidth > 0'), 'Source photograph failed to load'
    assert page.locator('.location').evaluate('(el)=>el.scrollWidth <= el.clientWidth'), 'Location text overflows'
    assert page.locator('.overlay').evaluate('(el)=>{const b=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return Math.abs((b.x+b.width/2)-(p.x+p.width/2))<1 && Math.abs((b.y+b.height/2)-(p.y+p.height/2))<1 && b.top>=p.top && b.bottom<=p.bottom}'), 'Cover text must be centered and fit within the photo'
    page.locator('figure').screenshot(path=output_path, type='jpeg', quality=95)
    browser.close()
print('Cover rendered from the original photo with location and price only.')
