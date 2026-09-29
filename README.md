# Mood Weather 🌦️

Type how you feel and watch the sky change. Mood Weather turns your feelings into a live forecast: sun, rain, storms, snow, fog or aurora, drawn live on a canvas behind the page.

**Live site:** https://lethal874.github.io/test.1/

## Features
- Mood detection from free text (with simple negation handling, so "not happy" isn't sunny)
- Animated canvas weather for six moods
- A quote and music suggestion for every mood
- Shareable links (`?mood=stormy`)
- Your last 7 moods saved in your browser (localStorage)
- Waitlist form powered by [Formspree](https://formspree.io)

## Run locally
It's plain HTML/CSS/JS with no build step. Open `index.html` in a browser, or serve the folder with any static server.

## Connect the waitlist form
1. Create a free form at formspree.io.
2. In `index.html`, replace `YOUR_FORM_ID` in the form's `action` with your form ID.
3. Until then, the form runs in demo mode and sends nothing.
