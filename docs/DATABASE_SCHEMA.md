# DATABASE SCHEMA — Firestore

مبدأ التصميم: تجنّب التداخل العميق (deeply nested collections)، استخدام subcollections بعمق مستوى واحد فقط تحت `branches`، وتخزين بيانات مكرَّرة بسيطة (denormalized) مثل اسم المنتج داخل سجل الإيراد لتفادي join إضافي عند القراءة.

## `users/{uid}`
| حقل | نوع | وصف |
|---|---|---|
| email | string | بريد المالك |
| displayName | string | اسم العرض |
| role | string | `"owner"` (لاحقًا: `"accountant"`) |
| createdAt | timestamp | |

## `branches/{branchId}`
| حقل | نوع | وصف |
|---|---|---|
| name | string | مثال: "الفرع الأول" |
| order | number | 1 أو 2 (ترتيب العرض) |
| active | boolean | |
| createdAt | timestamp | |

## `products/{productId}`
| حقل | نوع | وصف |
|---|---|---|
| name | string | اسم المنتج |
| category | string | تصنيف (بيتزا، مقبلات، مشروبات، حلويات...) |
| price | number | سعر البيع الافتراضي |
| cost | number? | تكلفة اختيارية لحساب هامش الربح |
| active | boolean | يظهر في نماذج الإدخال الجديدة أم لا |
| createdAt | timestamp | |

## `branches/{branchId}/revenues/{revenueId}`
| حقل | نوع | وصف |
|---|---|---|
| productId | string | مرجع للمنتج |
| productName | string | منسوخ وقت الإدخال (denormalized) |
| quantity | number | الكمية المباعة |
| unitPrice | number | سعر الوحدة وقت البيع |
| total | number | `quantity * unitPrice` |
| date | string | `YYYY-MM-DD` — لفلترة سريعة حسب اليوم |
| timestamp | timestamp | التاريخ والوقت الكامل — لتحليل الساعة/اليوم |
| note | string? | ملاحظة اختيارية |
| createdBy | string | uid |
| createdAt | timestamp | وقت الإنشاء الفعلي (audit) |
| updatedAt | timestamp? | وقت آخر تعديل |

## `branches/{branchId}/expenses/{expenseId}`
| حقل | نوع | وصف |
|---|---|---|
| category | string | أحد: رواتب، إيجار، مواد غذائية، كهرباء، ماء، غاز، صيانة، توصيل، تسويق، أخرى |
| amount | number | المبلغ |
| date | string | `YYYY-MM-DD` |
| timestamp | timestamp | |
| note | string? | |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp? | |

## الفهارس (Indexes)

كل استعلامات التقارير تستخدم `orderBy('timestamp')` مع `where('date', '>=', ...)` `where('date', '<=', ...)` ضمن نفس الـ subcollection — هذا يقع ضمن الفهارس التلقائية أحادية الحقل لـ Firestore، ولا حاجة لفهرس مركب طالما لا يوجد `where` على أكثر من حقل مع `orderBy` على حقل مختلف. إن أضاف Firestore Console اقتراح فهرس مركب لاحقًا سيُحفظ في `firestore.indexes.json`.

## لماذا لا يوجد جدول "تقارير" مخزَّن مسبقًا؟

كل التحليلات (الأفضل مبيعًا، ذروة الوقت، مقارنة الفروع...) تُحسب عند الطلب من `revenues`/`expenses` مباشرة على الجهاز (انظر `ANALYTICS_MODEL.md`). هذا يبقي مصدر الحقيقة واحدًا، ويتجنّب الحاجة لـ Cloud Functions (خطة Blaze مدفوعة).
