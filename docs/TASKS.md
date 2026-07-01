# TASKS

قائمة مهام تنفيذية حيّة — تُحدَّث أثناء العمل (✅ = منجز، ⬜ = متبقٍ).

## Sprint 0
- ✅ PROJECT_BRIEF.md, OWNER_REQUIREMENTS.md, UI_DESIGN.md, DATABASE_SCHEMA.md, FIREBASE_STRUCTURE.md, ANALYTICS_MODEL.md, ROADMAP.md, SPRINT_PLAN.md, TASKS.md
- ✅ إنشاء مشروع Expo (TypeScript template) + expo-router (تعديل: React Native/Expo بدل Flutter — Flutter/Java غير مثبَّتين على الجهاز، Expo يعمل فورًا ومجانًا)
- ✅ تثبيت: firebase, nativewind+tailwindcss v3, zustand, react-native-gifted-charts, expo-print, expo-sharing, xlsx, @expo-google-fonts/cairo, expo-file-system, expo-splash-screen, @expo/vector-icons
- ✅ `src/firebase/config.ts` (Auth+Firestore) + `src/firebase/auth.ts` + `.env.example`
- ✅ `firestore.rules` + `firestore.indexes.json`
- ✅ ألوان الثيم (Light/Dark) + Tailwind config + خط Cairo + فرض RTL (`src/utils/rtl.ts`, `src/store/theme.ts`)
- ✅ شعار SVG (`design/logo.svg`) + توليد أيقونات Expo تلقائيًا (`scripts/generate-icons.js`)
- ✅ Root layout + Bottom Tabs skeleton + شاشة تسجيل الدخول (مربوطة فعليًا بـ Firebase Auth، أبكر من المخطط)
- ✅ commit محلي: `feat(sprint-0): scaffold app, docs, Firebase wiring, theme/RTL, nav skeleton`
- ✅ تحقق بصري عبر متصفح: RTL، الخط، الألوان، تبديل الوضع الداكن، الشعار — كلها تعمل بشكل صحيح

## Sprint 1
- ✅ ربط شاشة الدخول بـ Firebase Auth فعليًا + معالجة الأخطاء بالعربية (أُنجز مبكرًا في السبرنت 0)
- ✅ حارس مصادقة فعلي (`useAuthListener` + Zustand `authStore` + redirect في index/login/(app) layout)
- ✅ Zustand store: `authStore` (user/profile/initializing/error) + `branchStore` (selectedBranchId محفوظ محليًا)
- ✅ خدمة `branches` (fetch realtime/create/rename) + شاشة إدارة الفروع (`app/(app)/branches.tsx`)
- ✅ خدمة تجميع `Period Summary` (`src/features/analytics/periodSummary.ts`) + مكوّن `StatCard` + `BranchSwitcher`
- ✅ شاشة Dashboard كاملة لليوم الحالي (دخل/مصروف/ربح + مقارنة فروع + أفضل فرع) — بدون الرؤى الذكية بعد (السبرنت 6)
- ✅ شاشة `settings` (تبديل الثيم + رابط إدارة الفروع + تسجيل الخروج)
- ✅ إصلاح: تعطّل التطبيق بالكامل (شاشة بيضاء) عند عدم ضبط `.env` — الآن يظهر رسالة عربية واضحة بدل الانهيار
- ✅ تحقق: `tsc --noEmit` و`eslint` بدون أخطاء + تحقق بصري عبر متصفح لحالة عدم الإعداد
- ✅ commit محلي

## Sprint 2
- ✅ خدمة `products` (لازمة لاختيار المنتج عند تسجيل الإيراد) + شاشة إدارة المنتجات
- ✅ خدمة `revenues` كاملة (create/update/delete + realtime listener بحسب فرع/تاريخ)
- ✅ نموذج إضافة/تعديل إيراد (`RevenueForm`: فرع، منتج، كمية، سعر، ملاحظة)
- ✅ قائمة إيرادات + تنقل بين الأيام + فلتر فرع (`BranchSwitcher`) + حذف مع تأكيد (`Alert`)
- ✅ تحقق: `tsc --noEmit` و`eslint` بدون أخطاء + تحقق بصري (لا تعطّل في حالة عدم المصادقة)
- ✅ commit محلي

## Sprint 3
- ✅ خدمة `expenses` كاملة (create/update/delete فوق القراءة الحية)
- ✅ نموذج إضافة/تعديل مصروف (`ExpenseForm`: فرع، تصنيف ثابت، مبلغ، ملاحظة)
- ✅ قائمة مصروفات + تنقل بين الأيام + فلتر فرع + حذف مع تأكيد
- ✅ تحقق: `tsc --noEmit` و`eslint` وتجميع الحزمة (bundle) بدون أخطاء
- ✅ commit محلي

## Sprint 4
- ✅ دوال تجميع أداء المنتجات (`src/features/analytics/productPerformance.ts`)
- ✅ محدد فترة (`PeriodSelector`: اليوم/الأسبوع/الشهر) قابل لإعادة الاستخدام في السبرنت 5 والتقارير
- ✅ شاشة تحليل المنتجات: الأكثر مبيعًا، الأعلى ربحًا (إن وُجدت تكلفة)، تحتاج مراجعة، مقارنة بين الفروع
- ✅ تحقق: `tsc --noEmit`، `eslint`، وتجميع الحزمة بدون أخطاء
- ✅ commit محلي

## Sprint 5
- ✅ دوال تجميع الوقت (`timePerformance.ts`: ساعة/يوم أسبوع + ذروة/ركود)
- ✅ شاشة تحليل الأوقات (`TimeAnalyticsSection`: رسمان بيانيان + نص أفضل/أضعف ساعات وأيام)
- ✅ إصلاح: `react-native-gifted-charts` يتعطل عند الإقلاع بدون `expo-linear-gradient`
  (تبعية بينية مطلوبة حتى بدون استخدام تدرّجات) — تمت إضافتها
- ✅ تحقق: `tsc --noEmit`، `eslint`، تجميع الحزمة، وتحقق بصري بدون أخطاء console
- ✅ commit محلي

## Sprint 6
- ✅ محرك قواعد الرؤى (`src/features/analytics/insights.ts`): مقارنة أسبوعية، مصروفات مرتفعة،
  تفوّق فرع مسائي، منتج ضعيف في فرع، أفضل منتج الشهر، ذروة يومية — كلها دوال خالصة قابلة للاختبار
- ✅ `useSmartInsights` يجمّع البيانات اللازمة (أسبوع حالي/سابق، الشهر، اليوم) ويشغّل القواعد
- ✅ `InsightBanner` على الـ Dashboard (أعلى 5 رؤى، الأولوية للتحذيرية)
- ✅ تحقق: `tsc --noEmit`، `eslint` (بعد إصلاح تحذير استيراد مكرر)، وتجميع الحزمة بدون أخطاء
- ✅ commit محلي

## Sprint 7
- ✅ شاشة التقارير (فترة اليوم/الأسبوع/الشهر + فلتر فرع) تغطي التقارير الستة
  المطلوبة (يومي/أسبوعي/شهري/فرع/منتج/مصروف) عبر محدد الفترة والفرع + أقسام
  التفصيل، بدل شاشات منفصلة لكل نوع (تبسيط متعمد يغطي نفس الحاجة)
- ✅ قالب HTML عربي RTL لتصدير PDF عبر `expo-print` + مشاركة عبر `expo-sharing`
- ✅ توليد Excel (أوراق: الملخص، الفروع، المصروفات، المنتجات) عبر `xlsx` + كتابة
  الملف عبر `expo-file-system/legacy` (وليس الواجهة الجديدة File/Directory
  التي لم تُختبر بعد) + مشاركة عبر `expo-sharing`
- ✅ تحقق: `tsc --noEmit`، `eslint`، تجميع الحزمة، وتحقق بصري بدون تعطّل
- ✅ commit محلي

## Sprint 8
- ⬜ مراجعة شاملة: Empty/Loading states، تباين الألوان، RTL
- ⬜ `tsc --noEmit` بدون أخطاء
- ⬜ تحديث كل ملفات `docs/` لتعكس الحالة النهائية الفعلية
- ⬜ commit محلي نهائي
