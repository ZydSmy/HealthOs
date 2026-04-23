# 🏥 HealthOS Egypt - نظام إدارة العيادات

نظام متكامل لإدارة العيادات الطبية والمستشفيات الصغيرة، مصمم بعناية لتسهيل عمل الأطباء والممرضين.

![HealthOS](https://img.shields.io/badge/HealthOS-Egypt-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Required-brightgreen)

## ✨ المميزات

- **لوحة تحكم ذكية** - إحصائيات ومراقبة realtime
- **ملفات المرضى** - إدارة كاملة لبيانات المرضى
- **الروشتات الطبية** - مع كشف تداخلات الأدوية
- **مخزن التحاليل** - تتبع نتائج التحاليل والأشعة
- **العلامات الحيوية** - رسوم بيانية لتطور الحالة
- **زر الطوارئ SOS** - الوصول السريع لبيانات المريض

## 🚀 طريقة التشغيل

### الطريقة الأولى: MongoDB متصلة (كامل)

```bash
# 1. تأكد إن MongoDB شغال
mongod

# 2. في terminal تاني، نزل المشروع وشغله
cd HealthOS
npm install
npm start

# 3. افتح المتصفح
http://localhost:8080
```

### الطريقة الثانية: بدون MongoDB (Demo Mode)

```bash
cd HealthOS
npm install
npm start
# هيفتح تلقائي على port 8080 حتى لو مفيش MongoDB
```

## 📁 هيكل المشروع

```
HealthOS/
├── index.html              # Frontend - واجهة المستخدم
├── style.css               # Styles - التنسيقات
├── app.js                  # Frontend Logic - منطق الواجهة
├── package.json            # Dependencies
├── README.md               # هذا الملف
└── Backend/
    ├── api-server/
    │   ├── server.js       # خادم Express
    │   └── package.json    
    ├── Models/             # نماذج MongoDB
    │   ├── Patient.js
    │   ├── Prescription.js
    │   ├── LabResult.js
    │   ├── VitalSigns.js
    │   └── Visit.js
    └── routes/             # API Routes
        ├── patient.js
        ├── prescription.js
        ├── labResult.js
        ├── vitalSigns.js
        ├── visits.js
        └── dashboard.js
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/healthz` | GET | فحص حالة النظام |
| `/api/patients` | GET | قائمة المرضى |
| `/api/patients` | POST | إضافة مريض جديد |
| `/api/prescriptions` | GET | قائمة الروشتات |
| `/api/prescriptions` | POST | إصدار روشتة |
| `/api/lab-results` | GET | نتائج التحاليل |
| `/api/lab-results` | POST | إضافة تحليل |
| `/api/vital-signs` | GET | العلامات الحيوية |
| `/api/visits` | GET | سجل الزيارات |
| `/api/dashboard/summary` | GET | ملخص لوحة التحكم |
| `/api/dashboard/activity` | GET | النشاط الأخير |

## 🛠️ المتطلبات

- **Node.js** 18 أو أحدث
- **MongoDB** (اختياري - النظام بيشتغل بدونه في Demo mode)
- **متصفب حديث** (Chrome, Firefox, Edge)

## ⚙️ الإعدادات

### متغيرات البيئة

```bash
# .env file (optional)
PORT=8080
MONGODB_URI=mongodb://localhost:27017/healthos_db
```

### تغيير port

```bash
PORT=3000 npm start
```

## 📱 صور من النظام

- واجهة Desktop-like متحركة
- نوافذ قابلة للسحب والتحريك
- تصميم Glassmorphism عصري
- دعم كامل للغة العربية (RTL)

## 🤝 المساهمة

نرحب بمساهماتكم! لو عندك اقتراح أو عايز تضيف feature:

1. Fork المشروع
2. اعمل branch جديد
3. اعمل commit بتغييراتك
4. افتح Pull Request

## 📜 License

MIT License - استخدمه في أي مشروع تجاري أو شخصي.

## 🙏 شكر خاص

- Font: Cairo from Google Fonts
- Charts: Chart.js
- Icons: Unicode Emojis

---

<p align="center">Made with ❤️ in Egypt</p>
