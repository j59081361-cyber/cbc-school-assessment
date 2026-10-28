CBC School Results Analytics - Windows desktop app (offline)

1. Install Node.js LTS from https://nodejs.org (one time, needs internet).
2. Open this folder in Command Prompt and run:
     npm install
     npm start          (test the app in a window)
     npm run build      (creates the installer)
3. The installer (.exe) appears in the "dist" folder. Copy it to any
   Windows PC; it works with no internet.

Data is stored inside the app on each computer. Use Backup / Restore
(under Saved assessments) to move data between computers or keep copies.

WHERE DATA LIVES (v1.1)
- Saved assessments are kept in a data file in the app's folder under
  your Windows AppData\Roaming folder, so there is no 5 MB browser limit.
- An automatic backup is written when you save an assessment, when the
  app opens and when it closes: one file per day, last 30 days kept.
  Use "Open backup folder" (under Saved assessments) to find them.
- To restore, use the Restore button and pick any backup file.

INSTALLER (v1.2)
- The installer is named CBC-Results-Analytics-Setup-<version>.exe, has the
  app icon, and creates a Desktop and Start Menu shortcut.
- Uninstalling does NOT delete saved assessments or backups.
- The installer is not code-signed, so Windows SmartScreen may show
  "Windows protected your PC" the first time. Click "More info", then
  "Run anyway". This is normal for unsigned school software.

SCHOOL LOGO (v1.3)
- The Springer Primary and Junior Secondary School crest, with the motto
  "Hard Work Pays", shows at the top of the app, on every printed report
  form and on the printed analysis. The same emblem is the app icon.
- The school name box starts as "Springer Primary and Junior Secondary
  School". The motto and crest are fixed in the app.
- Logo files are in the "build" folder (logo.svg, logo.png).


DATA VALIDATION (v1.4)
- CSV import supports quoted fields, including commas inside quoted learner names.
- Marks must be numeric and between 0 and 100; invalid values are rejected with row, learner and learning-area details. Values are never silently clamped.
- Duplicate learner names are flagged before analysis to reduce accidental double-counting. If learners share a name, distinguish them in the name field until unique admission-number support is added.
- The installer has not been built or tested on Windows by this source-editing step; build with npm install and npm run build on a Windows or supported build machine before distribution.
