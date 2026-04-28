#!/usr/bin/env python3
"""Generate a multi-page PDF from the investor deck HTML.
Uses Playwright to screenshot each slide individually, then merges into one PDF."""

import asyncio
import os
import sys
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_HTML = os.path.join(SCRIPT_DIR, "investor-deck.html")
OUTPUT_PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SCRIPT_DIR, "AdherePod-Investor-Deck.pdf")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # 16:9 landscape
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto(f"file://{INPUT_HTML}", wait_until="networkidle")
        await page.wait_for_timeout(2000)  # fonts

        # Hide nav, make all visible
        await page.evaluate("""
            document.querySelectorAll('.slide').forEach(s => s.classList.add('visible'));
            const pb = document.querySelector('.progress-bar');
            const nd = document.querySelector('.nav-dots');
            if (pb) pb.style.display = 'none';
            if (nd) nd.style.display = 'none';
        """)

        slide_count = await page.evaluate("document.querySelectorAll('.slide').length")
        print(f"Found {slide_count} slides")

        merger = PdfWriter()

        for i in range(slide_count):
            # Hide all slides except current one, use clip approach
            await page.evaluate(f"""
                const slides = document.querySelectorAll('.slide');
                slides.forEach((s, idx) => {{
                    s.style.display = idx === {i} ? 'flex' : 'none';
                }});
                // Reset scroll
                document.documentElement.style.scrollSnapType = 'none';
                window.scrollTo(0, 0);
            """)
            await page.wait_for_timeout(200)

            tmp_path = f"/tmp/adherepod_slide_{i}.pdf"
            await page.pdf(
                path=tmp_path,
                width="1920px",
                height="1080px",
                print_background=True,
                margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
                prefer_css_page_size=False,
            )

            reader = PdfReader(tmp_path)
            merger.add_page(reader.pages[0])
            os.remove(tmp_path)
            print(f"  Captured slide {i + 1}/{slide_count}")

        merger.write(OUTPUT_PDF)
        merger.close()
        await browser.close()

    size = os.path.getsize(OUTPUT_PDF)
    print(f"Done! {OUTPUT_PDF} ({size // 1024}KB)")

asyncio.run(main())
