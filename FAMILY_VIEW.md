# Pal family view

The family dashboard is the separate page at `family.html`. The original person-facing app remains at `index.html`.

## What is connected now

Both pages read and write the same IndexedDB record (`withyou-local` / `app-state`) when opened on the same browser origin and browser profile. This means profile details and photos, guardian details, medicines, reminder completion, emergency contacts and Moments can be viewed in either page. A BroadcastChannel keeps the two open tabs updated when one page changes shared data.

The family page can also add medicines and reminders, and can mark them taken/done. Those updates are written back to the same Pal record.

## Location sharing

The person must open **Find my way** in Pal and allow location access. While that screen remains open and visible, Pal shares location updates with the family page. Sharing pauses when the person leaves that screen or the app goes into the background. The family page shows the last shared point and timestamp; it does not claim that an old location is current.

Family members can add expected places (for example, home or a familiar day centre). When a new location update is outside every saved radius, the family page can show an alert. The default home address is prefilled in the expected-place form, but is only geocoded after a family member chooses **Add expected place**.

## Family reminders and notifications

Enable browser notifications from the family page, then add daily check-in times. The page can also alert when a scheduled medicine or reminder has not been marked complete 15 minutes after its time.

These are browser-side prompts that work while the family page is open and running. They are not guaranteed background or push notifications. A browser may suspend a background tab, and closing the page stops its reminder checks. A medicine marked as taken is only a record in Pal; the app cannot verify that medicine was actually taken.

## What is still needed for different phones

This version does **not** yet sync across different devices or family members' browser profiles. GitHub Pages serves the static pages and cannot by itself provide a private shared database, authenticated family access, server-side geofence monitoring or reliable push notifications.

For cross-device use, configure a secure shared backend (for example, Supabase with authentication, row-level security and realtime updates) and a server-side notification service. Do not put a database service-role key or any secret key in the public GitHub repository. Background location also requires an appropriate native mobile implementation and explicit user permission; a normal web page cannot guarantee continuous location after it is closed or suspended.
