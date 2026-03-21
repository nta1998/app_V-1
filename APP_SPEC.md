# מסמך הגדרת אפליקציה - מערכת ניהול עסקאות נדל"ן

> גרסה: 2.0 (פירוט מלא)
> תאריך: 2026-03-15

---

## 1. סקירה כללית

### מטרת האפליקציה
אפליקציה מובייל לניהול תהליך רכישת דירה מקצה לקצה.
חברת הנדל"ן מנהלת את הפרויקטים, מצמידה דירות ללקוחות, ומלווה אותם דרך כל שלבי העסקה - מחוזה ועד סגירה - כולל חתימה דיגיטלית על מסמכים, לוח תשלומים, ומעקב אחרי צוות הטיפול.

### קהל יעד

| תפקיד | מי | מה עושה |
|--------|----|---------|
| **אדמין** | עובדי חברת הנדל"ן | מנהל פרויקטים, מצמיד דירות, מעלה מסמכים, מאשר חתימות, מנהל תשלומים |
| **לקוח** | רוכשי דירות | צופה בנכסים, חותם על מסמכים, עוקב אחרי עסקה, רואה לוח תשלומים |

---

## 2. הרשמה והתחברות

### 2.1 תהליך הרשמה
1. הלקוח נרשם דרך **Google** או **Apple Sign-In**
2. לאחר ההרשמה, החשבון **ממתין לאישור אדמין**
3. האדמין מאשר את הלקוח מתוך ממשק הניהול
4. רק אחרי אישור - הלקוח יכול להיכנס ולהשתמש באפליקציה

### 2.2 סטטוסי משתמש
- `pending` - נרשם, ממתין לאישור
- `approved` - אושר, יכול להשתמש
- `blocked` - חסום

### 2.3 מסך התחברות - פירוט
- לוגו האפליקציה במרכז
- כפתור **"התחבר עם Google"** (אייקון Google + טקסט)
- כפתור **"התחבר עם Apple"** (אייקון Apple + טקסט)
- ללא אפשרות הרשמה עם אימייל/סיסמה ידנית
- לאחר התחברות ראשונה (הרשמה):
  - מסך "ממתין לאישור" עם אנימציה/אייקון שעון
  - הודעה: "החשבון שלך ממתין לאישור. נודיע לך כשיאושר"
  - כפתור "רענן סטטוס" לבדיקה ידנית
- לאחר אישור: ניתוב אוטומטי לדף הבית

### 2.4 מסך אדמין - אישור לקוחות
- רשימת לקוחות בסטטוס `pending` מוצגת בראש מסך ניהול הלקוחות
- באדג' עם מספר הממתינים
- לכל לקוח ממתין:
  - שם, אימייל, תאריך הרשמה
  - כפתור **"אשר"** (ירוק)
  - כפתור **"חסום"** (אדום)
- התראה לאדמין כשנרשם לקוח חדש

---

## 3. צד לקוח - כל המסכים בפירוט

### 3.1 ניווט (Tab Bar)
הלקוח מנווט עם 4 טאבים (RTL - מימין לשמאל):

```
┌──────────────────────────────────────────────┐
│  [פרופיל]  [התראות]  [העסקה שלי]  [בית]  │
│     👤         🔔        📋         🏠      │
└──────────────────────────────────────────────┘
```

- **בית** (ברירת מחדל) - דף בית
- **העסקה שלי** - מסך עסקה (גלוי רק אם יש עסקה פעילה, אחרת מוסתר)
- **התראות** - מרכז התראות
- **פרופיל** - פרופיל אישי

### 3.2 דף בית

#### Header
- ברכה דינמית לפי שעה:
  - 05:00-11:59 → "בוקר טוב, [שם]"
  - 12:00-16:59 → "צהריים טובים, [שם]"
  - 17:00-20:59 → "ערב טוב, [שם]"
  - 21:00-04:59 → "לילה טוב, [שם]"
- תמונת פרופיל (עיגול, פינה ימנית)
- אייקון פעמון התראות עם badge מספרי (פינה שמאלית)

#### כרטיס עסקה פעילה (מוצג רק אם יש עסקה)
```
┌─────────────────────────────────────┐
│  🏠 העסקה שלי                       │
│                                     │
│  בניין A, דירה 12                   │
│  פרויקט תל אביב                     │
│                                     │
│  שלב נוכחי: חוזה                    │
│  [===●=========] 50%                │
│                                     │
│  [    צפה בעסקה    ]               │
└─────────────────────────────────────┘
```
- לחיצה → מעביר למסך העסקה שלי

#### סקשן פרויקטים מומלצים
- כותרת: "פרויקטים"
- רשימה אופקית (horizontal scroll) של כרטיסי פרויקטים
- כל כרטיס: תמונה, שם פרויקט, כתובת, סוג (תמ"א/פינוי-בינוי)
- כפתור "הצג הכל" → מעביר לרשימת פרויקטים מלאה

#### סקשן "מה חדש"
- 2-3 התראות אחרונות שלא נקראו
- לחיצה → פתיחת ההתראה

### 3.3 רשימת פרויקטים

#### מסך ראשי
- כותרת: "פרויקטים זמינים"
- חיפוש חופשי (שם פרויקט / כתובת)
- אפשרות לצפייה על מפה (מיקום הפרויקטים)

#### כרטיס פרויקט ברשימה
```
┌─────────────────────────────────────┐
│  [      תמונת פרויקט        ]      │
│                                     │
│  פרויקט הגולדה, תל אביב             │
│  📍 רחוב הירקון 45                  │
│  🏗️ תמ"א 38                        │
│  🏢 12 דירות זמינות                  │
└─────────────────────────────────────┘
```
- לחיצה → דף פרויקט

#### דף פרויקט
- **Header**: תמונה גדולה עם gradient כהה + שם הפרויקט
- **פרטים**:
  - כתובת מלאה
  - תיאור הפרויקט (טקסט חופשי)
  - סוג (תמ"א / פינוי-בינוי / חדש)
  - מיקום על מפה (Google Maps)
- **גלריית תמונות**: סליידר אופקי של תמונות/מסמכי שיווק
- **רשימת דירות**:
  - כל דירה כשורה/כרטיס:
    - כתובת ספציפית (בניין, קומה, דירה)
    - מחיר: ₪X,XXX,XXX
    - גודל: XX מ"ר
    - חדרים: X
    - קומה: X
  - לחיצה → דף דירה

### 3.4 דף דירה

#### Header
- גלריית תמונות (swipeable) עם counter (1/5)
- כפתור חזרה + כפתור שיתוף + כפתור מועדפים ❤️

#### פרטים עיקריים (grid)
```
┌──────────┬──────────┬──────────┐
│  💰       │  📐       │  🚪       │
│ ₪2.5M    │ 120 מ"ר  │ 4 חדרים  │
├──────────┼──────────┼──────────┤
│  🏢       │  🧭       │  🚗       │
│ קומה 8   │ מזרח     │ חניה כפולה│
└──────────┴──────────┴──────────┘
```

#### פרטים נוספים
- מרפסת: XX מ"ר
- שכונה
- ליווי בנקאי: כן/לא
- תאריך כניסה
- תיאור חופשי

#### כפתורי פעולה (fixed bottom bar)
```
┌─────────────────────────────────────┐
│  [📞 התקשר]     [💬 WhatsApp]      │
└─────────────────────────────────────┘
```
- "התקשר" → פותח חייגן עם מספר החברה
- "WhatsApp" → פותח WhatsApp עם הודעה מוכנה:
  "היי, אני מתעניין בדירה ב[כתובת], פרויקט [שם]"

### 3.5 מסך העסקה שלי

נגיש רק אחרי שהאדמין הצמיד דירה ללקוח.
אם אין עסקה פעילה → הטאב מוסתר מה-tab bar.

#### Header
- כותרת: "העסקה שלי"
- סטטוס באדג' (פעיל / הושלם)

#### סקשן 1 - פרטי הדירה
```
┌─────────────────────────────────────┐
│  תמונת דירה                         │
│                                     │
│  בניין A, דירה 12                   │
│  פרויקט הגולדה, תל אביב             │
│                                     │
│  💰 ₪2,500,000  │  📐 120 מ"ר       │
│  🚪 4 חדרים     │  🏢 קומה 8        │
└─────────────────────────────────────┘
```

#### סקשן 2 - שלבי העסקה (Progress Tracker)
סרגל התקדמות ויזואלי אופקי עם 4 שלבים:

```
   ✓ הצמדה  ──→  ● חוזה  ──→  ○ חתימה  ──→  ○ סגירה
   01/03/26       05/03/26
```

כל שלב מציג:
- **הושלם** (✓): רקע ירוק, תאריך השלמה
- **נוכחי** (●): רקע זהב, תאריך התחלה, אנימציית pulse
- **עתידי** (○): רקע אפור, ללא תאריך
- פס מחבר בין השלבים (צבעוני עד השלב הנוכחי, אפור אחרי)

#### סקשן 3 - צוות הטיפול
```
┌─────────────────────────────────────┐
│  👥 הצוות שלך                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 יוסי כהן                 │   │
│  │ מנהל עסקה                   │   │
│  │ [📞 התקשר]  [💬 WhatsApp]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 עו"ד שרה לוי             │   │
│  │ עורכת דין                   │   │
│  │ [📞 התקשר]  [💬 WhatsApp]   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

כל איש צוות מציג:
- אווטאר / אייקון ברירת מחדל
- שם מלא
- תפקיד
- כפתורי פעולה: התקשר + WhatsApp

#### סקשן 4 - מסמכים
```
┌─────────────────────────────────────┐
│  📄 מסמכים                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📋 חוזה רכישה               │   │
│  │ הועלה: 05/03/2026           │   │
│  │ סטטוס: ⏳ ממתין לחתימה      │   │
│  │ [  👁️ צפה  ] [  ✍️ חתום  ]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📋 נספח תשלומים             │   │
│  │ הועלה: 01/03/2026           │   │
│  │ סטטוס: ✅ אושר              │   │
│  │ [  👁️ צפה  ] [  ⬇️ הורד  ] │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

כל מסמך מציג:
- אייקון לפי סוג (PDF/תמונה)
- שם הקובץ
- תאריך העלאה
- סטטוס חתימה:
  - `PENDING` → "⏳ ממתין לחתימה" + כפתור **"חתום"**
  - `SIGNED` → "📝 נחתם, ממתין לאישור"
  - `APPROVED` → "✅ אושר"
  - `REJECTED` → "❌ נדחה - נדרשת חתימה מחדש" + כפתור **"חתום שוב"**
- כפתורי פעולה:
  - **צפה** - פותח את המסמך (PDF viewer)
  - **חתום** - פותח מסך חתימה (רק כשסטטוס PENDING או REJECTED)
  - **הורד** - שמירה למכשיר

#### סקשן 5 - לוח תשלומים
```
┌─────────────────────────────────────┐
│  💳 לוח תשלומים                     │
│                                     │
│  סה"כ: ₪2,500,000                  │
│  שולם: ₪500,000 (20%)              │
│  [=========○○○○○○○○○○] 20%         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ #1  15/04/2026              │   │
│  │ תשלום ראשון                 │   │
│  │ ₪250,000          ✓ שולם   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ #2  15/07/2026              │   │
│  │ תשלום שני                   │   │
│  │ ₪250,000       ⏳ ממתין     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ #3  15/10/2026              │   │
│  │ תשלום שלישי                 │   │
│  │ ₪500,000        ○ עתידי    │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ #4  מסירה                   │   │
│  │ תשלום אחרון                 │   │
│  │ ₪1,500,000      ○ עתידי    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

- **סיכום בראש**: סה"כ מחיר, כמה שולם, progress bar
- **כל תשלום**: מספר, תאריך, תיאור, סכום, סטטוס
- סטטוסים:
  - **שולם** (ירוק ✓): תשלום בוצע + תאריך ביצוע
  - **ממתין** (כתום ⏳): הגיע מועד, ממתין לביצוע
  - **עתידי** (אפור ○): טרם הגיע המועד
- **צבעי בורדר**: ירוק/כתום/אפור בהתאם לסטטוס

### 3.6 מסך חתימה דיגיטלית

נפתח כשהלקוח לוחץ "חתום" על מסמך.

#### תצוגת המסמך
- PDF viewer במסך מלא (scrollable)
- הלקוח קורא את כל המסמך

#### אזור חתימה (בתחתית)
```
┌─────────────────────────────────────┐
│  ✍️ חתום כאן                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    [אזור ציור חתימה]        │   │
│  │    באצבע או stylus          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [🗑️ נקה]                          │
│                                     │
│  אני מאשר/ת שקראתי את המסמך        │
│  ואני חותם/ת מרצוני החופשי.  [✓]   │
│                                     │
│  [       ✅ שלח חתימה       ]      │
└─────────────────────────────────────┘
```

- **אזור ציור**: Canvas component - הלקוח חותם באצבע
- **כפתור "נקה"**: מוחק את החתימה ומאפשר לחתום מחדש
- **Checkbox אישור**: חייב לסמן לפני שליחה
- **כפתור "שלח חתימה"**:
  - פעיל רק כשיש חתימה + checkbox מסומן
  - שולח → מסך אישור: "החתימה נשלחה בהצלחה!"
  - חוזר למסך העסקה, סטטוס המסמך משתנה ל-`SIGNED`

#### מה קורה טכנית בחתימה:
1. החתימה שצוירה נשמרת כתמונה (PNG/SVG)
2. התמונה מוטמעת על ה-PDF במיקום החתימה
3. ה-PDF החתום מועלה כ-`signed_file` ב-DealDocument
4. `signing_status` משתנה ל-`SIGNED`
5. נוצרת התראה לאדמין: "הלקוח [שם] חתם על [שם מסמך]"
6. נוצר ActivityLog: DOC_SIGNED

### 3.7 מסך התראות

#### Header
- כותרת: "התראות"
- כפתור "סמן הכל כנקרא"

#### רשימת התראות
```
┌─────────────────────────────────────┐
│  🔵 חוזה חדש זמין לחתימה           │
│  חוזה רכישה חדש הועלה לעסקה שלך.   │
│  אנא היכנס לצפייה ולחתימה.         │
│  לפני 5 דקות                        │
├─────────────────────────────────────┤
│  ○ החתימה שלך אושרה               │
│  החתימה על חוזה הרכישה אושרה       │
│  בהצלחה. העסקה התקדמה לשלב הבא.    │
│  לפני 2 ימים                        │
├─────────────────────────────────────┤
│  ○ תזכורת תשלום                    │
│  תשלום מספר 2 בסך ₪250,000 אמור    │
│  להתבצע ב-15/07/2026.              │
│  לפני 3 ימים                        │
└─────────────────────────────────────┘
```

- **לא נקראה** (🔵): רקע מודגש, נקודה כחולה
- **נקראה** (○): רקע רגיל
- **סוגי התראות** עם אייקונים:
  - `DOCUMENT` 📄 - מסמך חדש / אושר / נדחה
  - `PAYMENT` 💳 - תזכורת תשלום
  - `STAGE` 📊 - עדכון שלב בעסקה
  - `GENERAL` 💬 - הודעה כללית מהאדמין
- לחיצה על התראה:
  - מסמנת כנקראה
  - אם קשורה לעסקה → מנווטת למסך העסקה
  - אם קשורה למסמך → מנווטת ישירות למסמך

### 3.8 מסך פרופיל

```
┌─────────────────────────────────────┐
│         [תמונת פרופיל]             │
│          📷 שנה תמונה               │
│                                     │
│  👤 שם מלא                          │
│  ┌─────────────────────────────┐   │
│  │ ישראל ישראלי                │   │
│  └─────────────────────────────┘   │
│                                     │
│  📧 אימייל                          │
│  ┌─────────────────────────────┐   │
│  │ israel@gmail.com  (🔒)      │   │
│  └─────────────────────────────┘   │
│                                     │
│  📞 טלפון                           │
│  ┌─────────────────────────────┐   │
│  │ 054-1234567                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  [       💾 שמור שינויים     ]     │
│                                     │
│  ──────────────────────────────    │
│                                     │
│  🔐 מחובר דרך: Google              │
│  📅 חבר מאז: מרץ 2026              │
│                                     │
│  [       🚪 התנתק             ]     │
└─────────────────────────────────────┘
```

- אימייל לא ניתן לעריכה (מגיע מ-Google/Apple)
- שם וטלפון ניתנים לעריכה
- תמונת פרופיל: לחיצה → בחירה מגלריה/מצלמה
- כפתור התנתק: ניקוי token + חזרה למסך התחברות

---

## 4. צד אדמין - כל המסכים בפירוט

### 4.1 ניווט אדמין (Tab Bar)

```
┌──────────────────────────────────────────────┐
│   [עסקאות]    [נכסים]     [דשבורד]          │
│     📋          🏢          🏠               │
└──────────────────────────────────────────────┘
```

3 טאבים גלויים + מסכים נסתרים נגישים דרך ניווט:
- ניהול לקוחות
- דוחות
- הוספת נכס/דירה
- פרטי עסקה

### 4.2 דשבורד אדמין

#### Header
- ברכה דינמית + שם האדמין + אווטאר
- אייקון פעמון עם badge (לקוחות ממתינים לאישור)

#### KPIs (סיכום מהיר)
```
┌────────────┬────────────┬────────────┐
│ 🏢 12      │ 👥 5       │ 📋 8       │
│ נכסים      │ לקוחות     │ עסקאות     │
│ פעילים     │ חדשים      │ פעילות     │
└────────────┴────────────┴────────────┘
```

#### פעולות מהירות (4 כפתורים)
1. **הוספת נכס** → מסך הוספת פרויקט/דירה
2. **ניהול לקוחות** → מסך לקוחות
3. **דוחות** → מסך דוחות
4. **לקוחות ממתינים** (badge עם מספר) → מסך אישור לקוחות

#### נכסים אחרונים
- 3 פרויקטים אחרונים (תמונה + כתובת + מספר דירות)
- כפתור "הצג הכל"

#### עסקאות שדורשות תשומת לב
- עסקאות שמחכות לאישור חתימה
- עסקאות עם תשלום שעבר את המועד
- מוצג כרשימה קצרה עם badge "דחוף"

### 4.3 ניהול פרויקטים

#### רשימת פרויקטים
- גריד 2 עמודות
- כל כרטיס: תמונה, שם, כתובת, מספר דירות, מספר עסקאות פעילות
- פילטר: הכל / פעיל / הושלם
- כפתור + ליצירת פרויקט חדש

#### הוספת/עריכת פרויקט
```
שדות:
├─ כתובת הפרויקט *          (text, required)
├─ תיאור                    (textarea)
├─ תמונת פרויקט             (image picker)
├─ קישור חיצוני             (URL)
├─ סוג פרויקט               (dropdown: תמ"א / פינוי-בינוי / חדש)
└─ [שמור]
```

- מיקום (lat/lng) מחושב אוטומטית מהכתובת (geocoding)

#### הוספת דירה לפרויקט
```
שדות:
├─ כתובת ספציפית *          (text: בניין X, קומה Y, דירה Z)
├─ מחיר *                   (number)
├─ גודל (מ"ר) *             (number)
├─ חדרים *                  (number)
├─ קומה *                   (number)
├─ כיווני אוויר              (text)
├─ מרפסת (מ"ר)              (number)
├─ חניה                     (text)
├─ שכונה                    (text)
├─ ליווי בנקאי              (toggle)
├─ תאריך כניסה              (date)
├─ תיאור                    (textarea)
├─ סוג                      (dropdown)
├─ תמונות                   (multi image picker)
└─ [שמור]
```

### 4.4 ניהול לקוחות

#### רשימה
- גריד 2 עמודות
- סקשן "ממתינים לאישור" בראש (אם יש)
- פילטר: הכל / ממתינים / מאושרים / חסומים
- חיפוש לפי שם / אימייל / טלפון

#### כרטיס לקוח (מתרחב בלחיצה)
```
┌─────────────────────────────────────┐
│  👤 ישראל ישראלי                    │
│  📞 054-1234567                     │
│  📧 israel@gmail.com                │
│  📅 נרשם: 01/03/2026               │
│  סטטוס: ✅ מאושר                    │
│                                     │
│  עסקה פעילה: כן (דירה 12, ת"א)     │
│                                     │
│  [📋 צפה בעסקה] [🔔 שלח התראה]     │
│  [🚫 חסום]                          │
└─────────────────────────────────────┘
```

#### שליחת התראה ללקוח
- Modal/bottom sheet:
  - כותרת ההתראה (text)
  - תוכן ההתראה (textarea)
  - סוג: כללי / מסמך / תשלום
  - כפתור "שלח"

### 4.5 ניהול עסקאות (הליבה)

#### רשימת עסקאות
- **Header**: שווי כולל, אחוז השלמה, מספר עסקאות
- **פילטר**: פעילות / הושלמו / הכל
- **כל עסקה ברשימה**:
  - כתובת דירה + פרויקט
  - שם לקוח
  - מחיר ₪
  - שלב נוכחי (badge צבעוני)
  - סטטוס (Active/Completed/Cancelled)
- לחיצה → מסך פרטי עסקה

#### יצירת עסקה חדשה (הצמדה)

תהליך ב-3 צעדים:

**צעד 1 - בחירת לקוח:**
- רשימת לקוחות מאושרים
- חיפוש לפי שם
- בחירה ← הבא

**צעד 2 - בחירת דירה:**
- בחירת פרויקט (dropdown)
- בחירת דירה מהפרויקט (רשימה)
- הצגת פרטי הדירה
- בחירה ← הבא

**צעד 3 - הגדרות:**
- צוות טיפול:
  - מנהל עסקה: שם + טלפון + אימייל
  - עורך דין: שם + טלפון + אימייל
- לוח תשלומים:
  - כפתור "הוסף תשלום" (ניתן להוסיף כמה שרוצים)
  - כל תשלום: תאריך + סכום + תיאור
  - סה"כ תשלומים מחושב אוטומטית
  - אזהרה אם הסכום לא תואם מחיר הדירה
- כפתור **"הצמד ויצור עסקה"**

**מה קורה אחרי יצירת עסקה:**
1. נוצר Deal בסטטוס Active, שלב ATTACHMENT
2. נוצרים DealTeamMember records
3. נוצרים Payment records
4. נוצרת התראה ללקוח: "דירה הוצמדה אליך!"
5. נוצר ActivityLog: DEAL_CREATE
6. נוצר DealTransaction ראשון: stage=ATTACHMENT, status=DONE

#### מסך פרטי עסקה (אדמין)

**Header**: שם לקוח + כתובת + מחיר + שלב נוכחי

**סקשן 1 - Progress bar** (זהה ללקוח + כפתורי ניהול)
- כפתור "קדם שלב" (ידני, לשימוש במקרים מיוחדים)

**סקשן 2 - מסמכים**
- רשימת כל המסמכים עם סטטוס
- כפתור **"העלה מסמך חדש"**:
  - בחירת קובץ (PDF/תמונה)
  - שם הקובץ
  - סוג (חוזה/ת.ז./אישור תשלום/אחר)
  - כפתור "העלה"
  - → נוצרת התראה ללקוח אוטומטית
- כפתור **"אשר חתימה"** (ליד כל מסמך בסטטוס SIGNED):
  - Modal: "האם לאשר את החתימה של [לקוח] על [מסמך]?"
  - אישור → signing_status = APPROVED + התראה ללקוח + קידום שלב
  - דחייה → signing_status = REJECTED + התראה ללקוח

**סקשן 3 - צוות טיפול**
- רשימת אנשי צוות
- כפתורי עריכה/מחיקה/הוספה

**סקשן 4 - לוח תשלומים**
- רשימת תשלומים עם סטטוסים
- כפתור "סמן כשולם" ליד כל תשלום שטרם שולם
- כפתור "הוסף תשלום" להוספת תשלום נוסף
- סיכום: סה"כ, שולם, נותר

**סקשן 5 - היסטוריית פעילות**
- לוג פעילות ספציפי לעסקה הזו (ActivityLog filtered by deal)
- מי עשה מה ומתי

### 4.6 דוחות

#### KPIs
- שווי עסקאות פעילות (₪)
- מספר עסקאות פעילות / הושלמו / בוטלו
- תשלומים ממתינים (כמות + סכום)

#### גרף התפלגות עסקאות לפי פרויקט
- Bar chart: ציר X = פרויקט, ציר Y = מספר עסקאות

#### התקדמות שלבים
- 3 progress bars:
  - בטיפול (ATTACHMENT + CONTRACT) → X%
  - ממתין לאישור (SIGNING) → X%
  - הושלם (CLOSING) → X%

#### סיכום נתונים
- מספר פרויקטים פעילים
- מספר לקוחות רשומים
- מספר עסקאות פעילות/מושלמות
- סך תשלומים שהתקבלו / ממתינים

### 4.7 פיד פעילות

- כותרת: "פעילות אחרונה"
- רשימת 20 פעילויות אחרונות (כרונולוגי)
- כל פעילות:
  - אווטאר + שם משתמש
  - תיאור (עברית): "פתח תיק חדש", "העלה מסמך: contract.pdf", "חתם על חוזה"
  - זמן יחסי: "עכשיו", "לפני 5 דק'", "לפני 2 שעות", "לפני 3 ימים"
  - badge סוג פעילות
- **מוגבל לאדמין בלבד** - לקוחות לא רואים את הפיד

---

## 5. מודל נתונים

### User (משתמש)
```
id              UUID, PK
email           string, unique
full_name       string
phone_number    string
avatar          image
auth_provider   enum: google | apple
provider_id     string (Google/Apple unique ID)
status          enum: pending | approved | blocked
is_staff        boolean (admin = true)
is_active       boolean
created_at      datetime
```

### Project (פרויקט)
```
id                  int, PK
project_address     string, unique
project_description text
project_image_url   URL
project_url         URL (קישור חיצוני)
latitude            float (auto-geocoded)
longitude           float (auto-geocoded)
created_at          datetime
```

### Apartment (דירה)
```
id                          int, PK
project                     FK → Project
price                       decimal
apartment_specific_address  string
apartment_size_sqm          float
number_of_rooms             float
floor                       int
facade                      string
balcony_size_sqm            float
air_directions              string
parking                     string
neighborhood                string
entry_date                  string
bank_escort                 boolean
description                 text
type                        string (תמ"א / פינוי-בינוי / חדש)
main_image_doc              FK → ApartmentDocument
```

### ApartmentDocument (תמונות דירה)
```
id          int, PK
apartment   FK → Apartment
file        FileField
doc_type    enum: MAIN | IMAGE | PDF
created_at  datetime
```

### ProjectDocument (מסמכי פרויקט)
```
id          int, PK
project     FK → Project
title       string
file        FileField
doc_type    enum: MARKETING | PLAN | CONTRACT | OTHER
created_at  datetime
```

### Deal (עסקה)
```
id          int, PK
user        FK → User (הלקוח)
apartment   FK → Apartment
project     FK → Project
status      enum: Active | Completed | Cancelled
stage       enum: ATTACHMENT | CONTRACT | SIGNING | CLOSING
created_at  datetime
```

### DealTeamMember (צוות טיפול)
```
id          int, PK
deal        FK → Deal
role        enum: DEAL_MANAGER | LAWYER
name        string
phone       string
email       string
```

### DealDocument (מסמך עסקה)
```
id              int, PK
deal            FK → Deal
uploaded_by     FK → User
filename        string
file            FileField (הקובץ המקורי)
file_type       enum: ID | CONTRACT | PAYMENT | OTHER
signing_status  enum: NONE | PENDING | SIGNED | APPROVED | REJECTED
signed_file     FileField (nullable - הקובץ החתום)
signature_image FileField (nullable - תמונת החתימה)
signed_at       datetime (nullable)
uploaded_at     datetime
```

### DealTransaction (שלב עסקה)
```
id              int, PK
deal            FK → Deal
document        FK → DealDocument (nullable)
stage           enum: ATTACHMENT | CONTRACT | SIGNING | CLOSING
status          enum: WAITING_CLIENT | WAITING_APPROVAL | DONE
description     text
request_date    datetime
completion_date datetime (nullable)
```

### Payment (תשלום)
```
id              int, PK
deal            FK → Deal
payment_number  int
due_date        date
amount          decimal
status          enum: paid | pending | upcoming
description     string (e.g., "תשלום ראשון", "מסירה")
paid_at         datetime (nullable)
created_at      datetime
```

### Notification (התראה)
```
id          int, PK
user        FK → User
deal        FK → Deal (nullable - לקישור ישיר לעסקה)
title       string
message     text
type        enum: DOCUMENT | PAYMENT | STAGE | GENERAL
is_read     boolean, default=false
created_at  datetime
```

### ActivityLog (לוג פעילות)
```
id              int, PK
user            FK → User
activity_type   enum: DEAL_CREATE | DOC_UPLOAD | DOC_SIGNED |
                      DOC_APPROVED | DOC_REJECTED | PAYMENT |
                      STAGE_CHANGE | USER_APPROVED
deal            FK → Deal (nullable)
description     text
metadata        JSON
created_at      datetime
```

---

## 6. API Endpoints

### אימות
```
POST   /api/auth/google/              → הרשמה/התחברות עם Google token
POST   /api/auth/apple/               → הרשמה/התחברות עם Apple token
GET    /api/auth/profile/             → פרופיל המשתמש המחובר
PATCH  /api/auth/profile/             → עדכון פרופיל (שם, טלפון, אווטאר)
GET    /api/auth/users/               → רשימת משתמשים [admin only]
PATCH  /api/auth/users/{id}/approve/  → אישור משתמש [admin only]
PATCH  /api/auth/users/{id}/block/    → חסימת משתמש [admin only]
GET    /api/auth/status/              → בדיקת סטטוס חשבון (pending/approved)
```

### נכסים
```
GET    /api/projects/                 → רשימת פרויקטים
POST   /api/projects/                 → הוספת פרויקט [admin only]
GET    /api/projects/{id}/            → פרטי פרויקט + דירות + מסמכים
PATCH  /api/projects/{id}/            → עדכון פרויקט [admin only]
DELETE /api/projects/{id}/            → מחיקת פרויקט [admin only]

GET    /api/apartments/               → רשימת דירות (?project_id=X)
POST   /api/apartments/               → הוספת דירה [admin only]
GET    /api/apartments/{id}/          → פרטי דירה + project + documents
PATCH  /api/apartments/{id}/          → עדכון דירה [admin only]

POST   /api/apartment-documents/      → העלאת תמונות דירה [admin only]
POST   /api/project-documents/        → העלאת מסמכי פרויקט [admin only]
```

### עסקאות
```
GET    /api/deals/                    → עסקאות (admin=הכל, user=שלו בלבד)
POST   /api/deals/                    → יצירת עסקה/הצמדה [admin only]
GET    /api/deals/{id}/               → פרטי עסקה (מסמכים, תשלומים, צוות, transactions)
PATCH  /api/deals/{id}/               → עדכון סטטוס/שלב [admin only]
```

### מסמכי עסקה
```
GET    /api/deal-documents/               → מסמכי עסקה (?deal_id=X)
POST   /api/deal-documents/               → העלאת מסמך [admin only]
GET    /api/deal-documents/{id}/          → פרטי מסמך + קישור להורדה
POST   /api/deal-documents/{id}/sign/     → העלאת חתימה [user - בעל העסקה בלבד]
POST   /api/deal-documents/{id}/approve/  → אישור חתימה [admin only]
POST   /api/deal-documents/{id}/reject/   → דחיית חתימה [admin only]
```

### צוות טיפול
```
GET    /api/deal-team/                → צוות (?deal_id=X)
POST   /api/deal-team/                → הוספת איש צוות [admin only]
PATCH  /api/deal-team/{id}/           → עדכון [admin only]
DELETE /api/deal-team/{id}/           → הסרה [admin only]
```

### תשלומים
```
GET    /api/payments/                 → תשלומים (?deal_id=X)
POST   /api/payments/                 → הוספת תשלום [admin only]
PATCH  /api/payments/{id}/            → עדכון סטטוס/פרטים [admin only]
DELETE /api/payments/{id}/            → מחיקת תשלום [admin only]
```

### שלבי עסקה
```
GET    /api/deal-transactions/        → שלבי עסקה (?deal_id=X)
POST   /api/deal-transactions/        → יצירת שלב [admin only]
PATCH  /api/deal-transactions/{id}/   → עדכון שלב [admin only]
```

### התראות
```
GET    /api/notifications/            → התראות המשתמש (scoped לuser)
POST   /api/notifications/            → שליחת התראה [admin only]
POST   /api/notifications/{id}/read/  → סימון כנקרא
GET    /api/notifications/unread-count/ → מספר התראות שלא נקראו
```

### פיד פעילות
```
GET    /api/activity-feed/            → לוג פעילות [admin only, max 20]
GET    /api/activity-feed/?deal_id=X  → לוג ספציפי לעסקה [admin only]
```

---

## 7. הרשאות - טבלה מפורטת

| פעולה | אנונימי | לקוח (pending) | לקוח (approved) | אדמין |
|-------|---------|----------------|-----------------|-------|
| התחברות Google/Apple | ✓ | - | - | - |
| בדיקת סטטוס חשבון | ✗ | ✓ | ✓ | ✓ |
| צפייה בנכסים | ✗ | ✗ | ✓ | ✓ |
| יצירת/עריכת פרויקט | ✗ | ✗ | ✗ | ✓ |
| צפייה בעסקה שלו | ✗ | ✗ | ✓ | ✓ |
| צפייה בכל העסקאות | ✗ | ✗ | ✗ | ✓ |
| יצירת עסקה (הצמדה) | ✗ | ✗ | ✗ | ✓ |
| העלאת מסמך לעסקה | ✗ | ✗ | ✗ | ✓ |
| חתימה על מסמך | ✗ | ✗ | ✓ (שלו) | ✗ |
| אישור/דחיית חתימה | ✗ | ✗ | ✗ | ✓ |
| ניהול תשלומים | ✗ | ✗ | ✗ | ✓ |
| ניהול צוות טיפול | ✗ | ✗ | ✗ | ✓ |
| צפייה בהתראות שלו | ✗ | ✗ | ✓ | ✓ |
| שליחת התראה | ✗ | ✗ | ✗ | ✓ |
| פיד פעילות | ✗ | ✗ | ✗ | ✓ |
| אישור/חסימת משתמשים | ✗ | ✗ | ✗ | ✓ |
| צפייה ברשימת משתמשים | ✗ | ✗ | ✗ | ✓ |

---

## 8. תהליך עסקה - תרשים זרימה מפורט

```
┌──────────────────────────────────────────────────────────────────┐
│                    תהליך עסקה מלא                                │
└──────────────────────────────────────────────────────────────────┘

  אדמין                              מערכת                 לקוח
  ─────                              ──────                 ─────

  [מאשר רישום לקוח]
       │                        → ActivityLog
       │                        → Notification ──────→ [מקבל: "חשבון אושר"]
       ▼
  ═══════════════════════════════════════════════════════════════
  שלב 1: הצמדה
  ═══════════════════════════════════════════════════════════════
  [בוחר לקוח + דירה]
  [מגדיר צוות טיפול]
  [מגדיר לוח תשלומים]
  [לוחץ "הצמד"]
       │                        → Deal (stage=ATTACHMENT)
       │                        → DealTeamMember x2
       │                        → Payment records
       │                        → DealTransaction (ATTACHMENT, DONE)
       │                        → ActivityLog: DEAL_CREATE
       │                        → Notification ──────→ [מקבל: "דירה הוצמדה"]
       │                                              [צופה בעסקה]
       │                                              [רואה צוות + תשלומים]
       ▼
  ═══════════════════════════════════════════════════════════════
  שלב 2: חוזה
  ═══════════════════════════════════════════════════════════════
  [מעלה חוזה PDF]
       │                        → DealDocument (signing_status=PENDING)
       │                        → Deal (stage=CONTRACT)
       │                        → DealTransaction (CONTRACT, WAITING_CLIENT)
       │                        → ActivityLog: DOC_UPLOAD
       │                        → Notification ──────→ [מקבל: "חוזה חדש"]
       │                                              [צופה בחוזה]
       ▼
  ═══════════════════════════════════════════════════════════════
  שלב 3: חתימה
  ═══════════════════════════════════════════════════════════════
       │                                              [חותם דיגיטלית]
       │                                                    │
       │                        ← signed_file ─────────────┘
       │                        → DealDocument (signing_status=SIGNED)
       │                        → ActivityLog: DOC_SIGNED
       │←───── Notification ────── "לקוח חתם על חוזה"
       │
  [בודק מסמך חתום]
       │
       ├── ✅ אישור ─────────→ → DealDocument (signing_status=APPROVED)
       │                        → Deal (stage=SIGNING → CLOSING)
       │                        → DealTransaction (SIGNING, DONE)
       │                        → ActivityLog: DOC_APPROVED
       │                        → Notification ──────→ [מקבל: "חתימה אושרה"]
       │
       └── ❌ דחייה ─────────→ → DealDocument (signing_status=REJECTED)
                                → ActivityLog: DOC_REJECTED
                                → Notification ──────→ [מקבל: "נא לחתום מחדש"]
                                                       [חותם שוב] → חוזר ↑
       │
       ▼
  ═══════════════════════════════════════════════════════════════
  שלב 4: סגירה
  ═══════════════════════════════════════════════════════════════
  [מוודא הכל הושלם]
  [סוגר עסקה]
       │                        → Deal (status=Completed)
       │                        → DealTransaction (CLOSING, DONE)
       │                        → ActivityLog: STAGE_CHANGE
       │                        → Notification ──────→ [מקבל: "העסקה הושלמה!"]
       ▼
  ═══════════════════════════════════════════════════════════════
  עסקה סגורה
  ═══════════════════════════════════════════════════════════════
```

---

## 9. התראות אוטומטיות - רשימה מלאה

| טריגר | נמען | כותרת | סוג |
|-------|------|-------|-----|
| אדמין מאשר לקוח | לקוח | "החשבון שלך אושר!" | GENERAL |
| אדמין מצמיד דירה (Deal created) | לקוח | "דירה הוצמדה אליך" | STAGE |
| אדמין מעלה מסמך | לקוח | "מסמך חדש זמין לעיון" | DOCUMENT |
| אדמין מעלה מסמך לחתימה | לקוח | "חוזה חדש ממתין לחתימתך" | DOCUMENT |
| לקוח חותם על מסמך | אדמין | "[שם] חתם על [מסמך]" | DOCUMENT |
| אדמין מאשר חתימה | לקוח | "החתימה שלך אושרה" | DOCUMENT |
| אדמין דוחה חתימה | לקוח | "נדרשת חתימה מחדש על [מסמך]" | DOCUMENT |
| עסקה מתקדמת שלב | לקוח | "העסקה שלך התקדמה לשלב [שלב]" | STAGE |
| 7 ימים לפני תשלום | לקוח | "תזכורת: תשלום בסך ₪X ב-[תאריך]" | PAYMENT |
| תשלום עבר את המועד | אדמין | "תשלום באיחור: [לקוח], ₪X" | PAYMENT |
| עסקה הושלמה | לקוח | "מזל טוב! העסקה הושלמה" | STAGE |
| לקוח חדש נרשם | אדמין | "לקוח חדש ממתין לאישור" | GENERAL |

---

## 10. טכנולוגיות

| שכבה | טכנולוגיה | הערות |
|------|-----------|-------|
| Frontend | React Native + Expo 55 + Expo Router | File-based routing, RTL |
| Backend | Django 6 + Django REST Framework | Token auth, ViewSets |
| Database | SQLite (dev) → PostgreSQL (prod) | |
| Auth | Google Sign-In + Apple Sign-In | expo-auth-session |
| Token | rest_framework.authtoken | Token per user |
| File Storage | Django FileField | local dev, S3 בprod |
| Push Notifications | Expo Notifications | FCM (Android) + APNs (iOS) |
| Digital Signing | react-native-signature-canvas | ציור חתימה באצבע |
| PDF Viewing | react-native-pdf | צפייה במסמכים |
| PDF Manipulation | pdf-lib (JS) | הטמעת חתימה על PDF |
| Maps | react-native-maps | מיקום פרויקטים |
| Styling | Custom theme, Glass morphism | Dark/Light, RTL, Manrope font |
| Geocoding | geopy + Nominatim | Server-side address → coordinates |

---

## 11. סיכום פערים מהמצב הנוכחי

להלן מה שצריך **לבנות או לתקן** ביחס למצב הנוכחי של הקוד:

### Backend (Django)

| # | פער | עדיפות | פירוט |
|---|-----|--------|-------|
| 1 | שדה `stage` ב-Deal | 🔴 | להוסיף enum: ATTACHMENT/CONTRACT/SIGNING/CLOSING |
| 2 | שדה `status` ב-User | 🔴 | להוסיף enum: pending/approved/blocked (במקום is_active בלבד) |
| 3 | מודל `Payment` | 🔴 | חדש: deal FK, due_date, amount, status, description |
| 4 | מודל `DealTeamMember` | 🔴 | חדש: deal FK, role, name, phone, email |
| 5 | שדות חתימה ב-`DealDocument` | 🔴 | signing_status, signed_file, signature_image, signed_at |
| 6 | API endpoint ל-DealDocument | 🔴 | ViewSet + router + sign/approve/reject actions |
| 7 | API endpoints ל-Payment | 🔴 | ViewSet + router |
| 8 | API endpoints ל-DealTeamMember | 🔴 | ViewSet + router |
| 9 | Google/Apple Auth endpoints | 🔴 | token verification + user creation/login |
| 10 | endpoint approve/block users | 🔴 | PATCH actions ב-UsersViewSet |
| 11 | endpoint progress שבור | 🔴 | לתקן/להחליף - שדות לא קיימים |
| 12 | סינון Deals לפי משתמש | 🟡 | user רואה רק שלו, admin רואה הכל |
| 13 | הרשאות admin-only | 🟡 | IsAdminUser permission class |
| 14 | סינון Activity feed | 🟡 | admin only + filter by deal_id |
| 15 | התראות אוטומטיות (signals) | 🟡 | signal on DealDocument/Deal/Payment → Notification |
| 16 | קידום שלב אוטומטי | 🟡 | approve → deal.stage advances |
| 17 | notifications unread-count endpoint | 🟠 | GET count for badge |
| 18 | שדה `type` ב-Notification | 🟠 | DOCUMENT/PAYMENT/STAGE/GENERAL |
| 19 | שדה `deal` ב-Notification | 🟠 | FK לקישור ישיר |

### Frontend (React Native / Expo)

| # | פער | עדיפות | פירוט |
|---|-----|--------|-------|
| 20 | Google/Apple Sign-In | 🔴 | expo-auth-session במקום login רגיל |
| 21 | מסך "ממתין לאישור" | 🔴 | מסך pending עם בדיקת סטטוס |
| 22 | חתימה דיגיטלית | 🔴 | react-native-signature-canvas + PDF embedding |
| 23 | PDF Viewer | 🔴 | react-native-pdf לצפייה במסמכים |
| 24 | מסך "העסקה שלי" (לקוח) | 🔴 | progress, צוות, מסמכים, תשלומים |
| 25 | מסך לוח תשלומים | 🔴 | רשימת תשלומים + progress bar |
| 26 | מסך צוות טיפול | 🔴 | אנשי קשר + WhatsApp/טלפון |
| 27 | מסך יצירת עסקה (אדמין) | 🔴 | wizard 3 שלבים |
| 28 | מסך פרטי עסקה (אדמין) | 🔴 | מסמכים + approve/reject + תשלומים |
| 29 | מסך אישור לקוחות (אדמין) | 🟡 | pending users + approve/block |
| 30 | Push notifications | 🟡 | Expo Notifications setup |
| 31 | Upload מסמכים מאדמין | 🟡 | file picker + multipart upload |
| 32 | Tab "העסקה שלי" דינמי | 🟠 | מוסתר כשאין עסקה פעילה |
| 33 | Deep link מהתראה למסך | 🟠 | לחיצה על התראה → ניווט ישיר |

---

## 12. API Request/Response Schemas

### 12.1 אימות

#### `POST /api/auth/google/`
```json
// Request
{
  "id_token": "eyJhbGciOiJSUzI1NiIs..."  // Google ID token from expo-auth-session
}

// Response 201 (new user)
{
  "token": "abc123def456",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@gmail.com",
    "full_name": "ישראל ישראלי",
    "avatar": null,
    "status": "pending",
    "is_staff": false
  },
  "is_new": true
}

// Response 200 (existing user)
{
  "token": "abc123def456",
  "user": { ... },
  "is_new": false
}

// Response 403 (blocked user)
{
  "error": "account_blocked",
  "message": "החשבון שלך חסום. פנה לתמיכה."
}
```

#### `POST /api/auth/apple/`
```json
// Request
{
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "full_name": "ישראל ישראלי"  // Apple sends name only on first auth
}

// Response: identical to Google
```

#### `GET /api/auth/status/`
```json
// Response 200
{
  "status": "pending" | "approved" | "blocked"
}
```

#### `GET /api/auth/profile/`
```json
// Response 200
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com",
  "full_name": "ישראל ישראלי",
  "phone_number": "054-1234567",
  "avatar": "https://storage.example.com/avatars/user1.jpg",
  "auth_provider": "google",
  "status": "approved",
  "is_staff": false,
  "created_at": "2026-03-01T10:00:00Z"
}
```

#### `PATCH /api/auth/profile/`
```json
// Request (multipart/form-data)
{
  "full_name": "ישראל ישראלי",
  "phone_number": "054-9876543",
  "avatar": <file>  // optional image
}

// Response 200: updated profile object
```

#### `GET /api/auth/users/` [admin only]
```json
// Response 200
[
  {
    "id": "550e8400-...",
    "email": "user@gmail.com",
    "full_name": "ישראל ישראלי",
    "phone_number": "054-1234567",
    "avatar": "...",
    "status": "approved",
    "auth_provider": "google",
    "created_at": "2026-03-01T10:00:00Z",
    "active_deal_count": 1
  }
]

// Query params: ?status=pending  |  ?search=ישראל
```

#### `PATCH /api/auth/users/{id}/approve/` [admin only]
```json
// Response 200
{
  "id": "550e8400-...",
  "status": "approved"
}
// Side effects: Notification to user, ActivityLog USER_APPROVED
```

#### `PATCH /api/auth/users/{id}/block/` [admin only]
```json
// Response 200
{
  "id": "550e8400-...",
  "status": "blocked"
}
```

### 12.2 נכסים

#### `GET /api/projects/`
```json
// Response 200
[
  {
    "id": 1,
    "project_address": "רחוב הירקון 45, תל אביב",
    "project_description": "פרויקט יוקרה במרכז תל אביב...",
    "project_image_url": "https://storage.example.com/projects/1.jpg",
    "project_url": "https://example.com/project-1",
    "latitude": 32.0853,
    "longitude": 34.7818,
    "apartment_count": 12,
    "available_apartment_count": 8,
    "created_at": "2026-01-15T08:00:00Z",
    "documents": [
      {
        "id": 1,
        "title": "חוברת שיווק",
        "file": "https://storage.example.com/docs/brochure.pdf",
        "doc_type": "MARKETING"
      }
    ]
  }
]

// Query params: ?search=תל אביב
```

#### `POST /api/projects/` [admin only]
```json
// Request (multipart/form-data)
{
  "project_address": "רחוב הרצל 10, חיפה",
  "project_description": "פרויקט חדש...",
  "project_image_url": <file>,  // or URL string
  "project_url": "https://example.com/new-project"
}

// Response 201
{
  "id": 2,
  "project_address": "רחוב הרצל 10, חיפה",
  "latitude": 32.7940,   // auto-geocoded
  "longitude": 34.9896,  // auto-geocoded
  ...
}
```

#### `GET /api/apartments/?project_id=1`
```json
// Response 200
[
  {
    "id": 1,
    "project": {
      "id": 1,
      "project_address": "רחוב הירקון 45, תל אביב"
    },
    "apartment_specific_address": "בניין A, קומה 8, דירה 12",
    "price": "2500000.00",
    "apartment_size_sqm": 120.0,
    "number_of_rooms": 4.0,
    "floor": 8,
    "facade": "מזרח",
    "balcony_size_sqm": 14.0,
    "air_directions": "מזרח, צפון",
    "parking": "חניה כפולה",
    "neighborhood": "לב העיר",
    "entry_date": "2027-06",
    "bank_escort": true,
    "description": "דירת 4 חדרים מרווחת...",
    "type": "חדש",
    "main_image": "https://storage.example.com/apartments/1_main.jpg",
    "images": [
      {
        "id": 1,
        "file": "https://storage.example.com/apartments/1_1.jpg",
        "doc_type": "IMAGE"
      }
    ],
    "has_active_deal": false
  }
]
```

#### `POST /api/apartments/` [admin only]
```json
// Request
{
  "project_id": 1,
  "apartment_specific_address": "בניין B, קומה 3, דירה 5",
  "price": 1800000,
  "apartment_size_sqm": 85,
  "number_of_rooms": 3,
  "floor": 3,
  "facade": "מערב",
  "balcony_size_sqm": 10,
  "parking": "חניה אחת",
  "neighborhood": "שכונת הדר",
  "bank_escort": true,
  "type": "תמ\"א 38"
}

// Response 201: full apartment object
```

### 12.3 עסקאות

#### `GET /api/deals/`
```json
// Response 200 (admin sees all, user sees own deals only)
[
  {
    "id": 1,
    "user": {
      "id": "550e8400-...",
      "full_name": "ישראל ישראלי",
      "email": "user@gmail.com",
      "phone_number": "054-1234567"
    },
    "apartment": {
      "id": 1,
      "apartment_specific_address": "בניין A, קומה 8, דירה 12",
      "price": "2500000.00",
      "main_image": "...",
      "project": {
        "id": 1,
        "project_address": "רחוב הירקון 45, תל אביב"
      }
    },
    "project": {
      "id": 1,
      "project_address": "רחוב הירקון 45, תל אביב"
    },
    "status": "Active",
    "stage": "CONTRACT",
    "stage_display": "חוזה",
    "created_at": "2026-03-05T14:00:00Z",
    "documents_count": 2,
    "pending_signatures": 1,
    "total_payments": "2500000.00",
    "paid_amount": "500000.00"
  }
]

// Query params: ?status=Active  |  ?project_id=1
```

#### `POST /api/deals/` [admin only]
```json
// Request
{
  "user_id": "550e8400-...",
  "apartment_id": 1,
  "project_id": 1,
  "team_members": [
    {
      "role": "DEAL_MANAGER",
      "name": "יוסי כהן",
      "phone": "050-1111111",
      "email": "yossi@company.com"
    },
    {
      "role": "LAWYER",
      "name": "עו\"ד שרה לוי",
      "phone": "050-2222222",
      "email": "sarah@law.com"
    }
  ],
  "payments": [
    {
      "payment_number": 1,
      "due_date": "2026-04-15",
      "amount": 250000,
      "description": "תשלום ראשון"
    },
    {
      "payment_number": 2,
      "due_date": "2026-07-15",
      "amount": 250000,
      "description": "תשלום שני"
    },
    {
      "payment_number": 3,
      "due_date": "2026-10-15",
      "amount": 500000,
      "description": "תשלום שלישי"
    },
    {
      "payment_number": 4,
      "due_date": "2027-06-01",
      "amount": 1500000,
      "description": "תשלום אחרון - מסירה"
    }
  ]
}

// Response 201
{
  "id": 1,
  "user": { ... },
  "apartment": { ... },
  "status": "Active",
  "stage": "ATTACHMENT",
  "team_members": [ ... ],
  "payments": [ ... ],
  "documents": [],
  "transactions": [
    {
      "id": 1,
      "stage": "ATTACHMENT",
      "status": "DONE",
      "description": "עסקה נוצרה"
    }
  ],
  "created_at": "2026-03-05T14:00:00Z"
}
```

#### `GET /api/deals/{id}/`
```json
// Response 200 (full deal detail)
{
  "id": 1,
  "user": { "id": "...", "full_name": "...", "email": "...", "phone_number": "..." },
  "apartment": {
    "id": 1,
    "apartment_specific_address": "בניין A, קומה 8, דירה 12",
    "price": "2500000.00",
    "apartment_size_sqm": 120.0,
    "number_of_rooms": 4.0,
    "floor": 8,
    "main_image": "...",
    "project": { "id": 1, "project_address": "..." }
  },
  "project": { "id": 1, "project_address": "..." },
  "status": "Active",
  "stage": "CONTRACT",
  "stage_display": "חוזה",
  "documents": [
    {
      "id": 1,
      "filename": "purchase_contract_v1.pdf",
      "file": "https://storage.example.com/deals/1/contract.pdf",
      "file_type": "CONTRACT",
      "file_type_display": "חוזה",
      "signing_status": "PENDING",
      "signing_status_display": "ממתין לחתימה",
      "signed_file": null,
      "signature_image": null,
      "signed_at": null,
      "uploaded_by": { "id": "...", "full_name": "אדמין" },
      "uploaded_at": "2026-03-06T10:00:00Z"
    }
  ],
  "transactions": [
    {
      "id": 1,
      "stage": "ATTACHMENT",
      "stage_display": "הצמדה",
      "status": "DONE",
      "status_display": "הושלם",
      "description": "עסקה נוצרה",
      "request_date": "2026-03-05T14:00:00Z",
      "completion_date": "2026-03-05T14:00:00Z"
    },
    {
      "id": 2,
      "stage": "CONTRACT",
      "stage_display": "חוזה",
      "status": "WAITING_CLIENT",
      "status_display": "ממתין ללקוח",
      "description": "חוזה הועלה, ממתין לחתימת הלקוח",
      "request_date": "2026-03-06T10:00:00Z",
      "completion_date": null
    }
  ],
  "team_members": [
    {
      "id": 1,
      "role": "DEAL_MANAGER",
      "role_display": "מנהל עסקה",
      "name": "יוסי כהן",
      "phone": "050-1111111",
      "email": "yossi@company.com"
    },
    {
      "id": 2,
      "role": "LAWYER",
      "role_display": "עורך דין",
      "name": "עו\"ד שרה לוי",
      "phone": "050-2222222",
      "email": "sarah@law.com"
    }
  ],
  "payments": [
    {
      "id": 1,
      "payment_number": 1,
      "due_date": "2026-04-15",
      "amount": "250000.00",
      "status": "paid",
      "status_display": "שולם",
      "description": "תשלום ראשון",
      "paid_at": "2026-04-14T12:00:00Z"
    },
    {
      "id": 2,
      "payment_number": 2,
      "due_date": "2026-07-15",
      "amount": "250000.00",
      "status": "pending",
      "status_display": "ממתין",
      "description": "תשלום שני",
      "paid_at": null
    }
  ],
  "created_at": "2026-03-05T14:00:00Z"
}
```

#### `PATCH /api/deals/{id}/` [admin only]
```json
// Request
{
  "status": "Completed"  // or "Cancelled"
}

// Response 200: updated deal object
```

### 12.4 מסמכי עסקה

#### `POST /api/deal-documents/` [admin only]
```json
// Request (multipart/form-data)
{
  "deal_id": 1,
  "filename": "purchase_contract_v1.pdf",
  "file": <file>,
  "file_type": "CONTRACT",         // CONTRACT | ID | PAYMENT | OTHER
  "signing_status": "PENDING"      // NONE (no signature needed) | PENDING (needs signature)
}

// Response 201
{
  "id": 1,
  "deal_id": 1,
  "filename": "purchase_contract_v1.pdf",
  "file": "https://...",
  "file_type": "CONTRACT",
  "signing_status": "PENDING",
  "uploaded_by": { "id": "...", "full_name": "אדמין" },
  "uploaded_at": "2026-03-06T10:00:00Z"
}
// Side effects: Notification to deal's user
```

#### `POST /api/deal-documents/{id}/sign/` [deal owner only]
```json
// Request (multipart/form-data)
{
  "signature_image": <file>,   // PNG of drawn signature
  "signed_file": <file>        // PDF with embedded signature
}

// Response 200
{
  "id": 1,
  "signing_status": "SIGNED",
  "signed_file": "https://...",
  "signature_image": "https://...",
  "signed_at": "2026-03-07T15:30:00Z"
}
// Side effects: Notification to admin, ActivityLog DOC_SIGNED
```

#### `POST /api/deal-documents/{id}/approve/` [admin only]
```json
// Response 200
{
  "id": 1,
  "signing_status": "APPROVED"
}
// Side effects:
//   - Notification to user: "החתימה שלך אושרה"
//   - Deal stage advances (CONTRACT → SIGNING → CLOSING)
//   - ActivityLog DOC_APPROVED
//   - DealTransaction updated to DONE + new transaction created
```

#### `POST /api/deal-documents/{id}/reject/` [admin only]
```json
// Request
{
  "reason": "החתימה לא ברורה, נא לחתום שוב"  // optional
}

// Response 200
{
  "id": 1,
  "signing_status": "REJECTED"
}
// Side effects:
//   - signing_status back to REJECTED (user can re-sign)
//   - signed_file and signature_image cleared
//   - Notification to user
//   - ActivityLog DOC_REJECTED
```

### 12.5 צוות טיפול

#### `GET /api/deal-team/?deal_id=1`
```json
// Response 200
[
  {
    "id": 1,
    "deal_id": 1,
    "role": "DEAL_MANAGER",
    "role_display": "מנהל עסקה",
    "name": "יוסי כהן",
    "phone": "050-1111111",
    "email": "yossi@company.com"
  }
]
```

#### `POST /api/deal-team/` [admin only]
```json
// Request
{
  "deal_id": 1,
  "role": "LAWYER",
  "name": "עו\"ד שרה לוי",
  "phone": "050-2222222",
  "email": "sarah@law.com"
}
// Response 201: team member object
```

### 12.6 תשלומים

#### `GET /api/payments/?deal_id=1`
```json
// Response 200
[
  {
    "id": 1,
    "deal_id": 1,
    "payment_number": 1,
    "due_date": "2026-04-15",
    "amount": "250000.00",
    "status": "paid",
    "status_display": "שולם",
    "description": "תשלום ראשון",
    "paid_at": "2026-04-14T12:00:00Z",
    "created_at": "2026-03-05T14:00:00Z"
  }
]
```

#### `PATCH /api/payments/{id}/` [admin only]
```json
// Request (mark as paid)
{
  "status": "paid",
  "paid_at": "2026-04-14T12:00:00Z"
}

// Response 200: updated payment object
// Side effects: ActivityLog PAYMENT, Notification to user
```

### 12.7 התראות

#### `GET /api/notifications/`
```json
// Response 200 (scoped to authenticated user)
[
  {
    "id": 1,
    "title": "חוזה חדש ממתין לחתימתך",
    "message": "חוזה רכישה חדש הועלה לעסקה שלך. אנא היכנס לצפייה ולחתימה.",
    "type": "DOCUMENT",
    "is_read": false,
    "deal_id": 1,
    "created_at": "2026-03-06T10:00:00Z"
  }
]
```

#### `GET /api/notifications/unread-count/`
```json
// Response 200
{
  "count": 3
}
```

#### `POST /api/notifications/{id}/read/`
```json
// Response 200
{
  "id": 1,
  "is_read": true
}
```

### 12.8 פיד פעילות

#### `GET /api/activity-feed/` [admin only]
```json
// Response 200 (max 20 entries, newest first)
[
  {
    "id": 15,
    "user_name": "ישראל ישראלי",
    "user_avatar": "https://...",
    "activity_type": "DOC_SIGNED",
    "activity_type_display": "חתימה על מסמך",
    "description": "ישראל ישראלי חתם על חוזה רכישה",
    "deal_id": 1,
    "metadata": {
      "document_id": 1,
      "document_name": "purchase_contract_v1.pdf"
    },
    "created_at": "2026-03-07T15:30:00Z"
  }
]

// Query params: ?deal_id=1 (filter by specific deal)
```

### 12.9 שגיאות - פורמט אחיד

כל השגיאות מוחזרות בפורמט אחיד:

```json
// 400 Bad Request (validation error)
{
  "error": "validation_error",
  "details": {
    "apartment_id": ["שדה זה הוא חובה."],
    "price": ["ודא שערך זה גדול מ-0."]
  }
}

// 401 Unauthorized
{
  "error": "not_authenticated",
  "message": "נדרשת התחברות."
}

// 403 Forbidden
{
  "error": "permission_denied",
  "message": "אין לך הרשאה לפעולה זו."
}

// 403 Forbidden (pending user)
{
  "error": "account_pending",
  "message": "החשבון שלך ממתין לאישור."
}

// 404 Not Found
{
  "error": "not_found",
  "message": "הפריט המבוקש לא נמצא."
}

// 409 Conflict
{
  "error": "conflict",
  "message": "לדירה זו כבר יש עסקה פעילה."
}
```

---

## 13. כללי עסקים ולוגיקת ולידציה

### 13.1 משתמשים

| כלל | פירוט |
|-----|-------|
| הרשמה | רק דרך Google/Apple Sign-In. אם האימייל כבר קיים - login, לא יצירה כפולה |
| pending → approved | רק אדמין יכול לאשר. ברגע האישור - הלקוח מקבל גישה מלאה |
| approved → blocked | אדמין יכול לחסום בכל רגע. משתמש חסום לא יכול להתחבר |
| blocked → approved | אדמין יכול לבטל חסימה |
| מחיקת משתמש | לא ניתנת אם יש לו עסקאות פעילות |

### 13.2 פרויקטים

| כלל | פירוט |
|-----|-------|
| כתובת | חובה, ייחודית. Geocoding אוטומטי בשמירה |
| מחיקה | לא ניתנת אם יש דירות עם עסקאות פעילות |
| Geocoding fails | שומר עם lat/lng=null, אדמין יכול לעדכן ידנית |

### 13.3 דירות

| כלל | פירוט |
|-----|-------|
| מחיר | חובה, חייב להיות > 0 |
| חדרים | מספר עשרוני (3.5 חדרים) |
| קומה | מספר שלם, יכול להיות 0 (קרקע) או שלילי (מרתף) |
| הצמדה | דירה אחת יכולה להיות מוצמדת רק לעסקה פעילה אחת |
| מחיקה | לא ניתנת אם יש עסקה פעילה |

### 13.4 עסקאות (Deals)

| כלל | פירוט |
|-----|-------|
| יצירה | רק אדמין. דורש: user_id (approved), apartment_id (ללא עסקה פעילה), project_id |
| סטטוס ברירת מחדל | Active, stage=ATTACHMENT |
| שלבים (stages) | סדר קבוע: ATTACHMENT → CONTRACT → SIGNING → CLOSING |
| קידום שלב | אוטומטי (ע"י אישור חתימה) או ידני (אדמין) |
| לא ניתן לדלג על שלב | ATTACHMENT → CLOSING ישירות לא מותר |
| ביטול עסקה | אדמין בלבד. משנה status ל-Cancelled, לא מוחק נתונים |
| השלמת עסקה | רק מ-stage=CLOSING. משנה status ל-Completed |
| עסקה ללקוח | לקוח יכול לראות רק עסקה שבה deal.user == request.user |

### 13.5 מסמכים (DealDocument)

| כלל | פירוט |
|-----|-------|
| העלאה | רק אדמין מעלה מסמכים |
| סוגי קבצים | PDF, JPG, PNG בלבד. מקסימום 10MB |
| signing_status | NONE (לא דורש חתימה), PENDING, SIGNED, APPROVED, REJECTED |
| חתימה | רק בעל העסקה יכול לחתום על מסמך שלו |
| חתימה חוזרת | אחרי REJECTED, signing_status חוזר ל-PENDING ומאפשר חתימה מחדש |
| אישור/דחייה | רק אדמין |
| אישור חתימה | מקדם את Deal.stage לשלב הבא (אם אין עוד מסמכים PENDING) |
| מחיקת מסמך | רק אדמין, רק אם signing_status != SIGNED (לא מוחקים מסמך שנחתם) |

### 13.6 תשלומים (Payment)

| כלל | פירוט |
|-----|-------|
| יצירה | רק אדמין, חייב deal_id |
| payment_number | auto-increment לפי deal, ממוין לפי due_date |
| סכום | חייב להיות > 0 |
| סטטוס | upcoming → pending (כשהגיע מועד) → paid (כשאדמין מסמן) |
| סטטוס אוטומטי | cron/signal: אם due_date <= today ו-status == upcoming → pending |
| סימון כשולם | אדמין בלבד. שומר paid_at = now() |
| תזכורת | 7 ימים לפני due_date → Notification ללקוח |
| איחור | due_date עבר + status != paid → Notification לאדמין |
| סה"כ תשלומים | אזהרה (לא חסימה) אם סכום התשלומים ≠ מחיר הדירה |

### 13.7 התראות (Notification)

| כלל | פירוט |
|-----|-------|
| יצירה | אוטומטית (signals) או ידנית (אדמין) |
| קריאה | רק בעל ההתראה יכול לסמן כנקראה |
| סינון | משתמש רואה רק את שלו |
| מחיקה | לא ניתנת - התראות נשמרות לתמיד |
| Deep link | אם יש deal_id → ניווט למסך העסקה, אחרת → רק סימון כנקראה |

### 13.8 פיד פעילות (ActivityLog)

| כלל | פירוט |
|-----|-------|
| יצירה | אוטומטית בלבד (signals). אין POST endpoint |
| צפייה | אדמין בלבד |
| מגבלה | מוחזרים 20 אחרונים בלבד |
| סינון | ?deal_id=X מחזיר פעילות ספציפית לעסקה |

---

## 14. מצבי UI - Loading, Empty, Error

### 14.1 מצבי Loading

| מסך / רכיב | תצוגת Loading |
|-------------|---------------|
| דף בית | Skeleton cards (3 כרטיסים אפורים מהבהבים) |
| רשימת פרויקטים | Skeleton grid (6 כרטיסים) |
| דף פרויקט | Skeleton: תמונה גדולה + 4 שורות טקסט |
| רשימת דירות | Skeleton rows (4 שורות) |
| מסך עסקה | Skeleton: progress bar + 3 sections |
| התראות | Skeleton list (5 שורות) |
| פיד פעילות | Skeleton list (5 שורות) |
| רשימת עסקאות (אדמין) | Skeleton list (5 כרטיסים) |
| העלאת קובץ | Progress bar עם אחוזים + spinner |
| חתימה - שליחה | Full-screen overlay: spinner + "שולח חתימה..." |
| התחברות | Full-screen overlay: spinner + "מתחבר..." |
| בדיקת סטטוס | Spinner קטן ליד כפתור "רענן" |

### 14.2 מצבי Empty

| מסך / רכיב | תצוגת Empty |
|-------------|-------------|
| דף בית - אין עסקה | כרטיס עסקה מוסתר. מוצג רק סקשן פרויקטים |
| דף בית - אין פרויקטים | "אין פרויקטים זמינים כרגע" + אייקון בניין |
| דף בית - אין התראות | סקשן "מה חדש" מוסתר |
| רשימת פרויקטים | אייקון בניין + "אין פרויקטים" + (אדמין: כפתור "הוסף פרויקט") |
| דירות בפרויקט | "אין דירות בפרויקט" + (אדמין: כפתור "הוסף דירה") |
| מסמכים בעסקה | "אין מסמכים עדיין" + אייקון תיקייה |
| תשלומים בעסקה | "לוח תשלומים טרם הוגדר" |
| צוות טיפול | "צוות טרם הוגדר" |
| התראות | "אין התראות" + אייקון פעמון + "נודיע לך כשיהיה משהו חדש" |
| רשימת עסקאות (אדמין) | "אין עסקאות" + כפתור "צור עסקה חדשה" |
| פיד פעילות | "אין פעילות לאחרונה" |
| לקוחות ממתינים | "אין לקוחות ממתינים לאישור" (badge מוסתר) |
| חיפוש ללא תוצאות | "לא נמצאו תוצאות ל-'[מילת חיפוש]'" |

### 14.3 מצבי שגיאה

| מצב | תצוגה | פעולת משתמש |
|-----|--------|------------|
| אין חיבור אינטרנט | Banner בראש: "אין חיבור לאינטרנט" (אדום) + נתונים מ-cache | כפתור "נסה שוב" |
| שגיאת שרת (500) | Modal: "שגיאה לא צפויה, נסה שוב" + אייקון ⚠️ | כפתור "נסה שוב" + כפתור "דווח על בעיה" |
| Session expired (401) | Auto-redirect למסך התחברות + toast: "נא להתחבר מחדש" | - |
| Account blocked (403) | מסך מלא: "החשבון חסום. פנה לתמיכה." + מספר טלפון | כפתור "התקשר" |
| Account pending (403) | מסך "ממתין לאישור" (כמו אחרי הרשמה) | כפתור "רענן סטטוס" |
| העלאת קובץ נכשלה | Toast: "ההעלאה נכשלה, נסה שוב" | כפתור retry בתוך ה-toast |
| קובץ גדול מדי (>10MB) | Toast: "הקובץ גדול מדי. מקסימום 10MB" | - |
| סוג קובץ לא נתמך | Toast: "סוג קובץ לא נתמך. PDF, JPG, PNG בלבד" | - |
| Geocoding נכשל | (אדמין) Toast: "לא ניתן לזהות כתובת. מיקום לא נשמר." | - |
| דירה כבר מוצמדת | (אדמין) Modal: "לדירה זו כבר יש עסקה פעילה" | - |
| חתימה ריקה | כפתור "שלח חתימה" disabled + tooltip: "חתום לפני שליחה" | - |
| checkbox לא מסומן | כפתור "שלח חתימה" disabled | - |

---

## 15. Edge Cases וטיפול מיוחד

### 15.1 אימות

| מקרה | התנהגות |
|------|---------|
| Google token פג תוקף | שגיאה 401, אפליקציה מבקשת token חדש אוטומטית |
| Apple משנה אימייל | מתבצע match לפי provider_id, לא לפי email |
| אותו אימייל ב-Google וב-Apple | שני חשבונות נפרדים (provider_id שונה). אופציונלי: merge בעתיד |
| אדמין חוסם משתמש שמחובר | בקריאת API הבאה → 403 → redirect ללוגין |
| משתמש pending מנסה לגשת לנכסים | 403 עם error: "account_pending" → redirect למסך המתנה |

### 15.2 עסקאות

| מקרה | התנהגות |
|------|---------|
| אדמין מנסה להצמיד דירה שכבר מוצמדת | שגיאה 409: "לדירה זו כבר יש עסקה פעילה" |
| אדמין מבטל עסקה עם מסמכים חתומים | מותר. העסקה עוברת ל-Cancelled, מסמכים נשמרים |
| אדמין מוחק פרויקט עם עסקאות פעילות | נחסם. שגיאה: "לא ניתן למחוק פרויקט עם עסקאות פעילות" |
| לקוח עם 2 עסקאות (אחת פעילה, אחת הושלמה) | מסך "העסקה שלי" מציג את הפעילה. היסטוריה בעתיד |
| עסקה ב-stage=CLOSING ואדמין מעלה מסמך חדש PENDING | stage לא חוזר אחורה. המסמך מתווסף אבל stage נשאר CLOSING |

### 15.3 מסמכים

| מקרה | התנהגות |
|------|---------|
| לקוח חותם על מסמך שכבר APPROVED | שגיאה 400: "המסמך כבר אושר" |
| לקוח חותם על מסמך של עסקה אחרת | שגיאה 403: "אין לך הרשאה" |
| מסמך REJECTED - לקוח חותם שוב | signing_status חוזר ל-SIGNED, signed_file מתעדכן |
| אדמין מעלה 2 מסמכים PENDING באותו שלב | שניהם חייבים להיות APPROVED לפני קידום שלב |
| אדמין מאשר מסמך 1 מתוך 2 | שלב לא מתקדם עד שכל המסמכים PENDING הם APPROVED |
| קובץ PDF פגום | האפליקציה מציגה "לא ניתן לפתוח את הקובץ" + כפתור הורדה |

### 15.4 תשלומים

| מקרה | התנהגות |
|------|---------|
| סכום תשלומים > מחיר דירה | אזהרה לאדמין, לא חסימה |
| סכום תשלומים < מחיר דירה | אזהרה: "חסרים ₪X להשלמת מחיר הדירה" |
| תשלום באיחור > 30 יום | badge "דחוף" על העסקה בדשבורד |
| אדמין מבטל סימון "שולם" | status חוזר ל-pending, paid_at=null |

### 15.5 התראות

| מקרה | התנהגות |
|------|---------|
| 100+ התראות | pagination - 20 בכל טעינה, infinite scroll |
| Push notification כשהאפליקציה סגורה | system notification, לחיצה פותחת את האפליקציה בהתראה |
| Push notification כשהאפליקציה פתוחה | in-app banner בראש המסך, נעלם אחרי 5 שניות |
| משתמש מסמן "הכל נקרא" | כל ההתראות is_read=true, badge מתאפס |

### 15.6 RTL וביטויים

| מקרה | התנהגות |
|------|---------|
| שמות באנגלית (אימייל) | מוצגים LTR בתוך layout RTL |
| מספרי טלפון | מוצגים LTR |
| מחירים | ₪ מופיע מימין למספר: "₪2,500,000" |
| תאריכים | פורמט DD/MM/YYYY |
| מספרים גדולים | מופרדים בפסיקים: 2,500,000 |

---

## 16. מבנה קבצים - Frontend (Expo Router)

### 16.1 מבנה תיקיות

```
app/
├── _layout.tsx                    # Root layout (providers, fonts, theme)
├── index.tsx                      # Redirect: auth check → login or tabs
│
├── (auth)/
│   ├── _layout.tsx                # Auth stack layout
│   ├── login.tsx                  # Google/Apple Sign-In buttons
│   └── pending.tsx                # "ממתין לאישור" screen
│
├── (client)/
│   ├── _layout.tsx                # Tab layout (בית, עסקה, התראות, פרופיל)
│   ├── (home)/
│   │   ├── _layout.tsx            # Home stack
│   │   ├── index.tsx              # Home screen (greeting, deal card, projects)
│   │   ├── projects/
│   │   │   ├── index.tsx          # Projects list
│   │   │   └── [id].tsx           # Project detail
│   │   └── apartments/
│   │       └── [id].tsx           # Apartment detail
│   ├── (deal)/
│   │   ├── _layout.tsx            # Deal stack
│   │   ├── index.tsx              # My deal (progress, team, docs, payments)
│   │   ├── documents/
│   │   │   └── [id].tsx           # Document viewer
│   │   └── sign/
│   │       └── [documentId].tsx   # Digital signing screen
│   ├── (notifications)/
│   │   ├── _layout.tsx
│   │   └── index.tsx              # Notifications list
│   └── (profile)/
│       ├── _layout.tsx
│       └── index.tsx              # Profile edit screen
│
├── (admin)/
│   ├── _layout.tsx                # Admin tab layout (דשבורד, נכסים, עסקאות)
│   ├── (dashboard)/
│   │   ├── _layout.tsx
│   │   └── index.tsx              # Admin dashboard (KPIs, quick actions)
│   ├── (properties)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Projects list (admin)
│   │   ├── create-project.tsx     # Create/edit project
│   │   ├── [projectId]/
│   │   │   ├── index.tsx          # Project detail (admin)
│   │   │   └── create-apartment.tsx
│   │   └── apartments/
│   │       └── [id].tsx           # Apartment detail (admin)
│   ├── (deals)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Deals list
│   │   ├── create/
│   │   │   ├── index.tsx          # Step 1: select client
│   │   │   ├── apartment.tsx      # Step 2: select apartment
│   │   │   └── setup.tsx          # Step 3: team + payments
│   │   └── [id]/
│   │       ├── index.tsx          # Deal detail (admin)
│   │       ├── documents.tsx      # Manage documents
│   │       ├── upload.tsx         # Upload document
│   │       ├── payments.tsx       # Manage payments
│   │       └── team.tsx           # Manage team
│   ├── (clients)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Clients list + pending approval
│   │   └── [id].tsx               # Client detail
│   ├── (reports)/
│   │   ├── _layout.tsx
│   │   └── index.tsx              # Reports dashboard
│   └── (activity)/
│       ├── _layout.tsx
│       └── index.tsx              # Activity feed
│
└── +not-found.tsx                 # 404 screen

components/
├── ui/                            # Reusable UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBanner.tsx
│   ├── ProgressBar.tsx
│   └── Modal.tsx
├── deal/
│   ├── DealCard.tsx               # Deal summary card
│   ├── StageTracker.tsx           # 4-step progress indicator
│   ├── TeamMemberCard.tsx         # Team member with contact buttons
│   ├── DocumentCard.tsx           # Document with sign/view buttons
│   ├── PaymentRow.tsx             # Single payment row
│   └── PaymentSummary.tsx         # Total/paid/progress
├── project/
│   ├── ProjectCard.tsx            # Project card in list
│   └── ApartmentCard.tsx          # Apartment card/row
├── notification/
│   └── NotificationItem.tsx       # Single notification row
└── signing/
    └── SignatureCanvas.tsx         # Drawing canvas for signature

hooks/
├── useAuth.ts                     # Auth state, login, logout
├── useApi.ts                      # API client with token
├── useDeal.ts                     # Active deal data + refresh
├── useNotifications.ts            # Notifications + unread count
└── usePushNotifications.ts        # Expo push token registration

services/
├── api.ts                         # Axios/fetch instance with auth headers
├── auth.ts                        # Google/Apple auth + token storage
├── pdf.ts                         # PDF viewing + signature embedding
└── storage.ts                     # SecureStore for token persistence

constants/
├── theme.ts                       # Colors, fonts, spacing
├── stages.ts                      # Deal stage definitions
└── config.ts                      # API URL, feature flags

types/
├── models.ts                      # TypeScript interfaces for all models
├── api.ts                         # API request/response types
└── navigation.ts                  # Route param types
```

### 16.2 ניווט ונתיבים

| Role | Root | Tab Layout | Tabs |
|------|------|------------|------|
| Anonymous | `(auth)/login` | - | - |
| Pending | `(auth)/pending` | - | - |
| Client | `(client)` | Tab bar | בית, העסקה שלי*, התראות, פרופיל |
| Admin | `(admin)` | Tab bar | דשבורד, נכסים, עסקאות |

\* מוסתר אם אין עסקה פעילה

### 16.3 Route Protection

```
_layout.tsx (root):
  1. Load token from SecureStore
  2. If no token → redirect to (auth)/login
  3. If token exists → fetch /api/auth/status/
     - pending → redirect to (auth)/pending
     - blocked → show blocked screen
     - approved + is_staff → redirect to (admin)
     - approved + !is_staff → redirect to (client)
```
