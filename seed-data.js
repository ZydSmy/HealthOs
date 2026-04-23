// Seed script to add mock data to HealthOS
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthos_db';

// Define schemas inline for seeding
const patientSchema = new mongoose.Schema({
  name: String,
  nationalId: String,
  dateOfBirth: Date,
  gender: String,
  bloodType: String,
  phone: String,
  address: String,
  allergies: [String],
  chronicDiseases: [String],
  emergencyContact: { name: String, phone: String },
  createdAt: { type: Date, default: Date.now }
});

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctorName: String,
  medications: [{ name: String, dosage: String, frequency: String, duration: Number }],
  createdAt: { type: Date, default: Date.now }
});

const labResultSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  testName: String,
  type: String,
  status: String,
  date: Date,
  createdAt: { type: Date, default: Date.now }
});

const vitalSignSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  date: Date,
  systolic: Number,
  diastolic: Number,
  heartRate: Number,
  bloodSugar: Number,
  temperature: Number,
  weight: Number,
  createdAt: { type: Date, default: Date.now }
});

const visitSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  date: Date,
  type: String,
  notes: String,
  doctor: String,
  createdAt: { type: Date, default: Date.now }
});

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Patient = mongoose.model('Patient', patientSchema);
    const Prescription = mongoose.model('Prescription', prescriptionSchema);
    const LabResult = mongoose.model('LabResult', labResultSchema);
    const VitalSign = mongoose.model('VitalSign', vitalSignSchema);
    const Visit = mongoose.model('Visit', visitSchema);

    // Clear existing data
    await Patient.deleteMany({});
    await Prescription.deleteMany({});
    await LabResult.deleteMany({});
    await VitalSign.deleteMany({});
    await Visit.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Mock patients
    const patientsData = [
      {
        name: 'أحمد محمد عبدالله',
        nationalId: '28706010123456',
        dateOfBirth: new Date('1987-06-01'),
        gender: 'male',
        bloodType: 'A+',
        phone: '01001234567',
        allergies: ['بنسلين'],
        chronicDiseases: ['سكري', 'ضغط'],
        emergencyContact: { name: 'محمد عبدالله', phone: '01009876543' }
      },
      {
        name: 'فاطمة أحمد محمود',
        nationalId: '29503050123456',
        dateOfBirth: new Date('1995-03-05'),
        gender: 'female',
        bloodType: 'O-',
        phone: '01011234567',
        allergies: [],
        chronicDiseases: ['حساسية صدرية'],
        emergencyContact: { name: 'أحمد محمود', phone: '01018765432' }
      },
      {
        name: 'محمد خالد إبراهيم',
        nationalId: '27809110123456',
        dateOfBirth: new Date('1978-09-11'),
        gender: 'male',
        bloodType: 'B+',
        phone: '01022234567',
        allergies: ['أسبرين'],
        chronicDiseases: ['ضغط'],
        emergencyContact: { name: 'سعاد إبراهيم', phone: '01027654321' }
      },
      {
        name: 'سارة عمر حسن',
        nationalId: '29012010123456',
        dateOfBirth: new Date('1990-12-01'),
        gender: 'female',
        bloodType: 'AB+',
        phone: '01033234567',
        allergies: [],
        chronicDiseases: [],
        emergencyContact: { name: 'عمر حسن', phone: '01036543210' }
      },
      {
        name: 'خالد محمود سعيد',
        nationalId: '26805030123456',
        dateOfBirth: new Date('1968-05-03'),
        gender: 'male',
        bloodType: 'O+',
        phone: '01044234567',
        allergies: ['صوديوم', 'بنسلين'],
        chronicDiseases: ['سكري', 'ضغط', 'قلب'],
        emergencyContact: { name: 'نادية سعيد', phone: '01045432109' }
      },
      {
        name: 'مريم علي فؤاد',
        nationalId: '29807080123456',
        dateOfBirth: new Date('1998-07-08'),
        gender: 'female',
        bloodType: 'A-',
        phone: '01055234567',
        allergies: [],
        chronicDiseases: ['أنيميا'],
        emergencyContact: { name: 'علي فؤاد', phone: '01054321098' }
      },
      {
        name: 'عبدالرحمن سمير عبدالعزيز',
        nationalId: '28502020123456',
        dateOfBirth: new Date('1985-02-02'),
        gender: 'male',
        bloodType: 'B-',
        phone: '01066234567',
        allergies: [],
        chronicDiseases: [],
        emergencyContact: { name: 'سمير عبدالعزيز', phone: '01063210987' }
      },
      {
        name: 'نورا حسين أحمد',
        nationalId: '29211050123456',
        dateOfBirth: new Date('1992-11-05'),
        gender: 'female',
        bloodType: 'O+',
        phone: '01077234567',
        allergies: ['لاتكس'],
        chronicDiseases: [],
        emergencyContact: { name: 'حسين أحمد', phone: '01072109876' }
      }
    ];

    const patients = await Patient.insertMany(patientsData);
    console.log(`✅ Added ${patients.length} patients`);

    // Add prescriptions
    const prescriptionsData = [
      {
        patient: patients[0]._id,
        doctorName: 'د. سمير محمود',
        medications: [
          { name: 'ميتفورمين', dosage: '500mg', frequency: 'مرتين يومياً', duration: 30 },
          { name: 'أملوديبين', dosage: '5mg', frequency: 'مرة يومياً', duration: 30 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        patient: patients[2]._id,
        doctorName: 'د. سمير محمود',
        medications: [
          { name: 'ليسينوبريل', dosage: '10mg', frequency: 'مرة يومياً', duration: 30 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        patient: patients[4]._id,
        doctorName: 'د. هاني عبدالله',
        medications: [
          { name: 'انسولين', dosage: '20 units', frequency: 'قبل الأكل', duration: 30 },
          { name: 'أسبرين', dosage: '81mg', frequency: 'مرة يومياً', duration: 30 },
          { name: 'أتورفاستاتين', dosage: '20mg', frequency: 'مرة مساءً', duration: 30 }
        ],
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        patient: patients[1]._id,
        doctorName: 'د. سمير محمود',
        medications: [
          { name: 'فنتولين', dosage: '2 puffs', frequency: 'عند اللزوم', duration: 14 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 3)
      },
      {
        patient: patients[6]._id,
        doctorName: 'د. هاني عبدالله',
        medications: [
          { name: 'أموكسيسيلين', dosage: '500mg', frequency: '3 مرات يومياً', duration: 7 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 4)
      }
    ];

    await Prescription.insertMany(prescriptionsData);
    console.log(`✅ Added ${prescriptionsData.length} prescriptions`);

    // Add lab results
    const labResultsData = [
      { patient: patients[0]._id, testName: 'HbA1c - تحليل السكر التراكمي', type: 'blood', status: 'abnormal', date: new Date(Date.now() - 86400000 * 7) },
      { patient: patients[0]._id, testName: 'CBC - تعداد دم كامل', type: 'blood', status: 'normal', date: new Date(Date.now() - 86400000 * 7) },
      { patient: patients[2]._id, testName: 'وظائف كلى', type: 'blood', status: 'normal', date: new Date(Date.now() - 86400000 * 10) },
      { patient: patients[2]._id, testName: 'أشعة صدر', type: 'xray', status: 'normal', date: new Date(Date.now() - 86400000 * 10) },
      { patient: patients[4]._id, testName: 'ECG - رسم قلب', type: 'other', status: 'abnormal', date: new Date(Date.now() - 86400000 * 3) },
      { patient: patients[4]._id, testName: 'تحليل بول', type: 'urine', status: 'normal', date: new Date(Date.now() - 86400000 * 3) },
      { patient: patients[5]._id, testName: 'فيريتين وحديد', type: 'blood', status: 'abnormal', date: new Date(Date.now() - 86400000 * 5) },
      { patient: patients[7]._id, testName: 'موجات صوتية على البطن', type: 'ultrasound', status: 'normal', date: new Date(Date.now() - 86400000 * 8) },
      { patient: patients[1]._id, testName: 'وظائف كبد', type: 'blood', status: 'normal', date: new Date(Date.now() - 86400000 * 12) },
      { patient: patients[3]._id, testName: 'فيتامين د', type: 'blood', status: 'abnormal', date: new Date(Date.now() - 86400000 * 15) }
    ];

    await LabResult.insertMany(labResultsData);
    console.log(`✅ Added ${labResultsData.length} lab results`);

    // Add vital signs for charts
    const vitalSignsData = [];
    for (const patient of patients) {
      for (let i = 0; i < 6; i++) {
        vitalSignsData.push({
          patient: patient._id,
          date: new Date(Date.now() - 86400000 * 30 * i),
          systolic: 110 + Math.floor(Math.random() * 30),
          diastolic: 70 + Math.floor(Math.random() * 20),
          heartRate: 60 + Math.floor(Math.random() * 20),
          bloodSugar: 80 + Math.floor(Math.random() * 80),
          temperature: 36.5 + Math.random() * 1,
          weight: 60 + Math.floor(Math.random() * 30)
        });
      }
    }

    await VitalSign.insertMany(vitalSignsData);
    console.log(`✅ Added ${vitalSignsData.length} vital signs records`);

    // Add visits
    const visitsData = [
      { patient: patients[0]._id, date: new Date(Date.now() - 86400000 * 2), type: 'كشف', notes: 'مراجعة ضغط وسكر', doctor: 'د. سمير محمود' },
      { patient: patients[4]._id, date: new Date(Date.now() - 86400000), type: 'كشف', notes: 'متابعة قلب', doctor: 'د. هاني عبدالله' },
      { patient: patients[1]._id, date: new Date(Date.now() - 86400000 * 3), type: 'استشارة', notes: 'حساسية صدرية', doctor: 'د. سمير محمود' },
      { patient: patients[2]._id, date: new Date(Date.now() - 86400000 * 5), type: 'كشف', notes: 'متابعة ضغط', doctor: 'د. سمير محمود' },
      { patient: patients[5]._id, date: new Date(Date.now() - 86400000 * 6), type: 'متابعة', notes: 'تحليل أنيميا', doctor: 'د. هاني عبدالله' },
      { patient: patients[0]._id, date: new Date(Date.now() - 86400000 * 32), type: 'كشف', notes: 'مراجعة سكر', doctor: 'د. سمير محمود' },
      { patient: patients[4]._id, date: new Date(Date.now() - 86400000 * 35), type: 'كشف', notes: 'متابعة عامة', doctor: 'د. سمير محمود' },
      { patient: patients[7]._id, date: new Date(Date.now() - 86400000 * 8), type: 'أشعة', notes: 'ألم بطن', doctor: 'د. هاني عبدالله' }
    ];

    await Visit.insertMany(visitsData);
    console.log(`✅ Added ${visitsData.length} visits`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('📊 Database is now populated with mock data.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedData();
