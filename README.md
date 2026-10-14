# NOIR - פרסומת בושם 15 שניות (9:16)

פרסומת תלת-ממד בקוד: Remotion + Three.js, עם פסקול מקורי מסונתז.

- תוצר: `out/noir-commercial.mp4` - 1080x1920, 30fps, 15 שניות, H.264 + AAC
- לוח זמנים משותף לתמונה ולסאונד: `src/timeline.json` (מכת הבס בפריים 270 = 9.0 שניות)
- מודל הבקבוק לפי קולאז׳ הייחוס: `src/Bottle.tsx`
- מצלמה רציפה אחת לכל הסרט: `src/Scene.tsx`
- פסקול: `audio/generate_soundtrack.py` (נכתב מאפס, ללא סאמפלים)
- פונטים: Cormorant Garamond, Montserrat (SIL OFL, מצורף ב-`public/fonts`)

## הרצה

```bash
npm install
npm run audio          # יוצר public/noir-soundtrack.wav
npx remotion studio    # תצוגה מקדימה
npx remotion render NoirCommercial out/noir-commercial.mp4
```

בסביבה בלי GPU הרינדור רץ על SwiftShader (`remotion.config.ts`).
