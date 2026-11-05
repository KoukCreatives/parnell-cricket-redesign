#!/usr/bin/env python3
"""Tiny static build: wraps each src/pages/*.html body in the shared head, header and footer.

    python3 build.py

Edit the header/footer once in src/partials and every page updates.
In Webflow these partials become Symbols; in WordPress, theme template parts.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
V = "53"  # bump to make browsers fetch fresh CSS/JS

PAGES = {
    "index":   ("Parnell Cricket Club – Inspiring a love of cricket in Tāmaki Makaurau",
                "Parnell Cricket Club, est. 1858 – New Zealand's oldest cricket club. Junior, youth and senior cricket in Auckland. Club of the Year 2024 & 2025.", ""),
    "join":    ("Join the club – Parnell Cricket Club",
                "Register for the 2026/27 season on PlayHQ. Fees, payment details, refunds and the junior waitlist.", "join"),
    "play":    ("Play cricket – Parnell Cricket Club",
                "Junior, youth and senior cricket for boys, girls, men and women at Parnell Cricket Club.", "play"),
    "juniors": ("Junior cricket (Years 0–8) – Parnell Cricket Club",
                "Everything parents need to know about junior cricket at Parnell: ages, season dates, fees, what to bring and how to sign up.", "play"),
    "gameday": ("Game Day – Parnell Cricket Club",
                "Draws, cancellations, season dates, grounds, uniform and scoring for Parnell Cricket Club players.", "gameday"),
    "coaching": ("Coaching – Parnell Cricket Club",
                 "Parnell's pro coaches, training, holiday programmes, winter academies and mental skills.", "coaching"),
    "club":    ("Our Club – Parnell Cricket Club",
                "New Zealand's oldest cricket club, est. 1858. Our story, values, people, honours, facilities and sponsors.", "club"),
    "news":    ("News & events – Parnell Cricket Club",
                "Club news, player spotlights and upcoming events at Parnell Cricket Club.", "news"),
    "library": ("Club Library – Parnell Cricket Club",
                "The full record of Parnell Cricket Club: past seasons, annual reports, honours boards, policies and archived news.", "club"),
}

def part(name):
    return (ROOT / "src" / "partials" / f"{name}.html").read_text()

def build():
    head, header, footer = part("head"), part("header"), part("footer")
    for slug, (title, desc, cur) in PAGES.items():
        body = (ROOT / "src" / "pages" / f"{slug}.html").read_text()
        hdr = re.sub(r"\{\{cur:(\w+)\}\}", lambda m: ' aria-current="page"' if m.group(1) == cur else "", header)
        html = (head.replace("{{title}}", title).replace("{{desc}}", desc)
                + hdr + body + footer).replace("{{v}}", V)
        (ROOT / f"{slug}.html").write_text(html)
        print("built", slug)

if __name__ == "__main__":
    build()
