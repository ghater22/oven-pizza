# TASKS

قائمة مهام تنفيذية حيّة — تُحدَّث أثناء العمل (✅ = منجز، ⬜ = متبقٍ).

## Sprint 0
- ✅ PROJECT_BRIEF.md, OWNER_REQUIREMENTS.md, UI_DESIGN.md, DATABASE_SCHEMA.md, FIREBASE_STRUCTURE.md, ANALYTICS_MODEL.md, ROADMAP.md, SPRINT_PLAN.md, TASKS.md
- ⬜ إنشاء مشروع Expo (TypeScript template) + expo-router
- ⬜ تثبيت: firebase, nativewind+tailwindcss, zustand, react-native-gifted-charts, expo-print, expo-sharing, xlsx, @expo-google-fonts/cairo, expo-file-system
- ⬜ `src/firebase/config.ts` + `.env.example`
- ⬜ `firestore.rules` + `firestore.indexes.json`
- ⬜ ألوان الثيم (Light/Dark) + Tailwind config + خط Cairo + فرض RTL
- ⬜ شعار SVG + أيقونات Expo (icon/adaptive-icon/splash)
- ⬜ Root layout + auth guard + Bottom Tabs skeleton + شاشة تسجيل الدخول (UI)
- ⬜ commit محلي: `feat(sprint-0): scaffold, docs, theme, firebase wiring`

## Sprint 1
- ⬜ ربط شاشة الدخول بـ Firebase Auth فعليًا + معالجة الأخطاء بالعربية
- ⬜ Zustand store: authUser, selectedBranchId, themeMode
- ⬜ خدمة `branches` (fetch/create/update) + شاشة إدارة الفروع
- ⬜ خدمة تجميع `Period Summary` + مكوّن `StatCard` + `BranchSwitcher`
- ⬜ شاشة Dashboard كاملة (بدون الرؤى الذكية بعد)
- ⬜ commit محلي

## Sprint 2
- ⬜ خدمة `revenues` (CRUD + realtime listener بحسب فرع/تاريخ)
- ⬜ نموذج إضافة/تعديل إيراد (Bottom Sheet)
- ⬜ قائمة إيرادات + فلاتر (تاريخ، فرع، منتج) + حذف مع تأكيد
- ⬜ commit محلي

## Sprint 3
- ⬜ خدمة `expenses` (CRUD)
- ⬜ نموذج إضافة/تعديل مصروف + قائمة تصنيفات ثابتة
- ⬜ قائمة مصروفات + فلاتر + حذف مع تأكيد
- ⬜ commit محلي

## Sprint 4
- ⬜ دوال تجميع أداء المنتجات (`src/features/analytics/products.ts`)
- ⬜ شاشة تحليل المنتجات (Top/Bottom، مقارنة فروع، ChartCard)
- ⬜ commit محلي

## Sprint 5
- ⬜ دوال تجميع الوقت (ساعة/يوم أسبوع)
- ⬜ شاشة تحليل الأوقات (رسوم بيانية + تمييز الذروة/الركود)
- ⬜ commit محلي

## Sprint 6
- ⬜ محرك قواعد الرؤى (`src/features/analytics/insights.ts`) + اختبار يدوي بسيناريوهات معروفة
- ⬜ `InsightBanner` على الـ Dashboard
- ⬜ commit محلي

## Sprint 7
- ⬜ شاشة التقارير (اختيار نوع/فترة) + إعادة استخدام دوال التحليلات
- ⬜ قالب HTML عربي RTL لتصدير PDF عبر `expo-print`
- ⬜ توليد Excel عبر `xlsx` + مشاركة الملف عبر `expo-sharing`
- ⬜ commit محلي

## Sprint 8
- ⬜ مراجعة شاملة: Empty/Loading states، تباين الألوان، RTL
- ⬜ `tsc --noEmit` بدون أخطاء
- ⬜ تحديث كل ملفات `docs/` لتعكس الحالة النهائية الفعلية
- ⬜ commit محلي نهائي
