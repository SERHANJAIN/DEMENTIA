# WithYou

**Tagline:** A little help, right when you need it.

WithYou is a minimalist, mobile-first Progressive Web App (PWA) designed around large tap targets, clear language, calm colors, readable text, spoken prompts, and separate sections for home directions, familiar people, memories, medicines, doctor visits, daily reminders, personal information, and emergency help.

## Put it on GitHub Pages

1. Create a new GitHub repository.
2. Upload **all files and folders inside this folder** into the repository root. Keep the `icons` folder and its files.
3. Open **Settings → Pages** in the repository.
4. Under the build/deployment source, choose **Deploy from a branch**, select your main branch and the `/ (root)` folder, and save.
5. Open the GitHub Pages URL shown there on your phone. Use the HTTPS version.

You do not need Node, npm, a database server, or a build step. It is plain HTML, CSS and JavaScript.

## Add it to a phone home screen

### iPhone
1. Open the published HTTPS site in **Safari**.
2. Tap **Share**.
3. Select **Add to Home Screen**.
4. Tap **Add**. Open WithYou from the new icon.

### Android
1. Open the published HTTPS site in **Chrome**.
2. Open the three-dot menu.
3. Choose **Install app** or **Add to Home screen** and follow the prompt.

## What works in this starter build

- First-use setup for the person's name, home address, and primary helper.
- A location screen that can request GPS permission, show a simple OpenStreetMap map, display a home marker when the saved address can be found, and estimate distance/direction.
- A button that opens Apple Maps walking directions on iOS or Google Maps walking directions on most other phones.
- Spoken text and reassuring prompts using the phone/browser's built-in speech synthesis.
- Familiar people and relationships, plus tap-to-call links.
- Memories with an optional photo and a note that can be read aloud.
- Medicine list with a “taken today” check.
- Month calendar for doctor visits.
- Daily tasks that can be ticked off.
- About-me and emergency details, including configurable emergency number.
- A family editing area with a basic 4-digit PIN, plus JSON backup export/import.
- An offline app shell for the main interface after it has loaded once. Map tiles and external map directions need internet.

## Important limitations (please read before relying on it for care)

This version is a **static, local-first prototype**, not a finished clinical or emergency-response system.

- **No family-to-family syncing:** information, task completion, and photos are stored in the browser's local IndexedDB on that device. A family member on another phone will not see changes automatically. Export/import can transfer a backup, but automatic sharing needs a backend such as Firebase or Supabase and access/security rules.
- **Background notifications:** this build can show browser notifications while WithYou is open and permission has been granted. Reliable scheduled notifications after the app is closed need a web-push server or a native app. GitHub Pages alone cannot send scheduled push messages.
- **Incoming caller pop-up:** a web app cannot inspect ordinary incoming cellular calls or draw an overlay above the phone's native call screen on iOS/Android. The People I Know section shows names and relationships, but does not identify a caller automatically. For the phone to show a familiar name on a normal incoming call, save important people in the phone's own Contacts app as well. A separate native app would be needed for a custom in-app caller overlay, and iOS still restricts that kind of behavior.
- **Navigation safety:** the map's dotted line is an approximate direction between GPS coordinates, not a walkable route. Use the phone's map app for real turn-by-turn routing. Location needs HTTPS and permission. Address lookup, map tiles, and the external map app need internet.
- **Privacy and security:** the family PIN is a simple convenience gate, not encryption. Data on the phone and exported backups may include sensitive health/contact information. Use a trusted, passcode-protected phone, keep backups private, and do not store more information than needed.
- **Medical safety:** medicine names, doses and timing should be entered and checked by a trusted family member with the person's healthcare professional. WithYou does not recommend, prescribe, or change treatment. It should not replace professional care or emergency services.

## Design choices

- Navy, sage, soft teal, peach, and warm terracotta accents.
- Very large touch targets and type, high-contrast text, simple symbols, direct labels, minimal navigation levels, and read-aloud options.
- Separate home buttons instead of combining unrelated tasks.

## Files

- `index.html` — app UI, styling, and functionality.
- `manifest.webmanifest` — install metadata for the phone home screen.
- `sw.js` — offline shell caching.
- `icons/` — app icons.
