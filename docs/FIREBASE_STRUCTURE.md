# FIREBASE STRUCTURE

## الخطة المستخدمة

**Spark (المجانية)** — لا Cloud Functions، لا أي اعتماد على خطة Blaze. كل الحسابات تتم داخل التطبيق (Client-side).

## خدمات مفعّلة

- **Authentication** → Email/Password فقط (مستخدم واحد الآن: المالك).
- **Firestore Database** → Production mode (مع قواعد أمان مخصصة أدناه، ليس Test mode المفتوح).
- **Storage**: غير مستخدم في الإصدار الحالي (لا صور منتجات مطلوبة في المتطلبات).

## خطوات الإعداد (يقوم بها المالك/المطوّر صاحب حساب Google — خطوة يدوية لمرة واحدة)

1. الذهاب إلى https://console.firebase.google.com وإنشاء مشروع جديد باسم مثلاً `pizza-oven-manager`.
2. تفعيل **Authentication → Sign-in method → Email/Password**.
3. إنشاء أول مستخدم مالك يدويًا من تبويب Authentication → Users (أو عبر شاشة تسجيل الدخول إن فُعِّل التسجيل الذاتي مؤقتًا ثم أُغلق).
4. تفعيل **Firestore Database** (اختيار موقع أقرب جغرافيًا، مثل `europe-west` أو `me-central` إن توفر).
5. من **Project Settings → General → Your apps** إضافة تطبيق ويب (Web app) — نفس مفاتيح Web SDK تُستخدم في Expo.
6. نسخ القيم إلى ملف `.env` في جذر المشروع (انظر `.env.example`):
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   EXPO_PUBLIC_FIREBASE_APP_ID=
   ```
7. بعد إضافة أول مستخدم عبر Authentication، إنشاء وثيقة يدوية في Firestore بمسار `users/{uid}` بنفس الـ uid، بحقل `role: "owner"` — هذا مطلوب لقواعد الأمان أدناه.
8. رفع قواعد الأمان الموجودة في `firestore.rules` عبر Firebase Console → Firestore → Rules، أو عبر Firebase CLI: `firebase deploy --only firestore:rules` (يتطلب `firebase login` تفاعلي).
9. إنشاء وثيقتي الفروع الأوليتين يدويًا أو من شاشة "إدارة الفروع" داخل التطبيق بعد أول تسجيل دخول.

## قواعد الأمان (ملخص — الملف الكامل `firestore.rules`)

- لا قراءة ولا كتابة بدون مصادقة.
- المستخدم يجب أن يملك وثيقة في `users/{uid}` (بغض النظر عن الدور حاليًا، لاحقًا يُفرَّق owner/accountant بالصلاحيات).
- لا استخدام لـ Firebase Admin SDK ولا Cloud Functions — كل التحقق عبر Firestore Rules فقط.

## الحصص المجانية (Spark) ولماذا تكفي

- Firestore: 50K قراءة / 20K كتابة / 20K حذف يوميًا — مطعم بفرعين بمعدل عشرات العمليات يوميًا بعيد جدًا عن هذا الحد.
- Auth: غير محدود عمليًا لعدد صغير من المستخدمين.
- لا تكلفة استضافة إضافية — التطبيق يعمل مباشرة من جهاز المالك (Expo/APK)، لا خادم ويب مطلوب.

## التوزيع (بدون متاجر تطبيقات)

لأن التطبيق خاص بالمالك فقط:
- تطوير/معاينة يومية: Expo Go (مجاني بالكامل، بدون حساب مدفوع).
- نسخة تركيب دائمة: بناء APK عبر `eas build -p android --profile preview` (يشمل عددًا مجانيًا من البنايات شهريًا ضمن الحصة المجانية لـ EAS) أو بناء محلي لاحقًا إن تم تثبيت Android SDK. لا حاجة لنشر على Google Play (يتطلب رسوم $25) ولا Apple App Store (يتطلب اشتراك $99/سنة) — يُطلب موافقة صريحة من المالك إن أراد ذلك مستقبلاً.
