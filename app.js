// ───────────── State ─────────────
let patients = [];
let patientMap = {};   // id → patient object
let vitalsChart = null;
let dragState = null;
let currentZIndex = 1; // لترتيب ظهور النوافذ فوق بعضها

// ───────────── Boot ─────────────
document.addEventListener('DOMContentLoaded', async () => {
  startClock(); // تحديث الساعة والتاريخ
  setupDrag();  // إعداد سحب النوافذ
  await initLocalStorageData(); // تهيئة البيانات من localStorage
  await loadPatients(); // تحميل المرضى من localStorage
  
  // تحديث الـ Dashboard والـ Activity وكل شيء بعد تحميل البيانات
  loadDashboard();
  loadActivity();
  loadPrescriptions();
  loadLabs();
  
  // Set today's date in lab form
  const labDate = document.getElementById('lab-date');
  if (labDate) labDate.value = new Date().toISOString().slice(0, 10);
  
  // Auto-load vitals for first patient (لو في مرضى موجودين)
  if (patients.length > 0) {
    selectPatient(patients[0]._id);
  }

  // افتح الـ Dashboard في وضع الشاشة الكاملة عند التحميل
  openWin('dashboard', true); 
});

// ───────────── LocalStorage Management (New) ─────────────

// توليد ID فريد بسيط
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// دالة لحفظ البيانات في localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// دالة لجلب البيانات من localStorage
function getFromLocalStorage(key, defaultValue = []) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// تهيئة البيانات الافتراضية في localStorage لو مفيش بيانات
async function initLocalStorageData() {
    // جلب البيانات الحالية
    let storedPatients = getFromLocalStorage('patients');
    let storedPrescriptions = getFromLocalStorage('prescriptions');
    let storedLabResults = getFromLocalStorage('lab_results');
    let storedVitalSigns = getFromLocalStorage('vital_signs');
    let storedActivities = getFromLocalStorage('activities');
    let storedVisits = getFromLocalStorage('visits'); // جلب الزيارات

    // لو مفيش مرضى، ضيف مريض افتراضي
    if (storedPatients.length === 0) {
        const defaultPatientId = generateId();
        storedPatients.push({
            _id: defaultPatientId,
            name: 'أحمد محمود',
            nationalId: '29010101402345',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            bloodType: 'A+',
            phone: '01001234567',
            allergies: ['بنسلين'],
            chronicDiseases: ['ضغط الدم'],
            createdAt: new Date().toISOString()
        });

        // ضيف نشاط إضافي للمريض الافتراضي
        storedActivities.unshift({
            _id: generateId(),
            type: 'patient',
            patientId: defaultPatientId,
            patientName: 'أحمد محمود',
            description: 'تم إضافة مريض جديد',
            timestamp: new Date().toISOString()
        });

        // ضيف روشتة افتراضية للمريض
        storedPrescriptions.push({
            _id: generateId(),
            patientId: defaultPatientId,
            patientName: 'أحمد محمود',
            prescribedBy: 'د. سمير محمود',
            medications: [
                { name: 'باراسيتامول', dosage: '500mg', frequency: 'مرتين يومياً', duration: 7 },
                { name: 'مضاد حيوي', dosage: '250mg', frequency: 'مرة يومياً', duration: 5 }
            ],
            createdAt: new Date().toISOString()
        });

        // ضيف نتيجة تحليل افتراضية للمريض
        storedLabResults.push({
            _id: generateId(),
            patientId: defaultPatientId,
            patientName: 'أحمد محمود',
            testName: 'تحليل سكر عشوائي',
            type: 'blood',
            status: 'normal',
            testDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });

        // ضيف علامات حيوية افتراضية للمريض
        storedVitalSigns.push({
            _id: generateId(),
            patientId: defaultPatientId,
            patientName: 'أحمد محمود',
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 75,
            bloodSugar: 100,
            recordedAt: new Date().toISOString()
        });

        // ضيف زيارة افتراضية للمريض (لمحاكاة وجود زيارات)
        storedVisits.push({
            _id: generateId(),
            patientId: defaultPatientId,
            visitDate: new Date().toISOString(),
            chiefComplaint: 'فحص دوري',
            reason: 'متابعة الصحة العامة',
            attendingPhysician: 'د. سمير محمود',
            createdAt: new Date().toISOString()
        });


        saveToLocalStorage('patients', storedPatients);
        saveToLocalStorage('prescriptions', storedPrescriptions);
        saveToLocalStorage('lab_results', storedLabResults);
        saveToLocalStorage('vital_signs', storedVitalSigns);
        saveToLocalStorage('activities', storedActivities);
        saveToLocalStorage('visits', storedVisits); // حفظ الزيارات
    }
}


// ───────────── Clock ─────────────
function startClock() {
  function tick() {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' });
    const el = document.getElementById('tb-time');
    const de = document.getElementById('tb-date');
    if (el) el.textContent = time;
    if (de) de.textContent = date;
  }
  tick();
  setInterval(tick, 1000);
}

// ───────────── Window Management ─────────────
function openWin(id, maximize = false) { // أضفنا معامل maximize
  const w = document.getElementById('win-' + id);
  if (!w) return;
  w.classList.remove('minimized', 'hidden');
  focusWin(w);
  if (maximize) { // لوmaximize بـ true، نكبر النافذة
    maxWin(id);
  } else { // لو مش عايزين نكبر، نرجعها للحجم الطبيعي لو كانت مكبرة
    w.classList.remove('maximized');
  }
}
function closeWin(id) {
  const w = document.getElementById('win-' + id);
  if (w) w.classList.add('hidden');
}
function minWin(id) {
  const w = document.getElementById('win-' + id);
  if (w) w.classList.toggle('minimized');
}
function maxWin(id) {
  const w = document.getElementById('win-' + id);
  if (w) w.classList.toggle('maximized');
  // لما بنعمل maximize، لازم نرجع الـ top والـ left عشان الـ maximized CSS يشتغل صح
  if (w.classList.contains('maximized')) {
      w.style.top = '';
      w.style.left = '';
  }
}
function focusWin(w) {
  document.querySelectorAll('.window').forEach(x => x.classList.remove('focused'));
  w.classList.add('focused');
  // زيادة الـ z-index عشان النافذة اللي تتعملها focus تيجي فوق الباقي
  w.style.zIndex = getNextZIndex();
}
// دالة لجلب الـ z-index التالي لضمان ظهور النافذة في المقدمة
function getNextZIndex() {
    return ++currentZIndex;
}


// ───────────── Drag ─────────────
function setupDrag() {
  document.querySelectorAll('.window-titlebar').forEach(bar => {
    const winId = bar.id.replace('tb-', '');
    const win = document.getElementById('win-' + winId);
    if (!win) return;

    bar.addEventListener('mousedown', e => {
      if (e.target.classList.contains('wc')) return;
      if (win.classList.contains('maximized')) return; // لا تسمح بالسحب إذا كانت مكبرة
      focusWin(win);
      const rect = win.getBoundingClientRect();
      dragState = { win, startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
      e.preventDefault();
    });
  });

  document.addEventListener('mousemove', e => {
    if (!dragState) return;
    // لا تسمح بالسحب إذا كانت النافذة مكبرة (تحقق مرة أخرى)
    if (dragState.win.classList.contains('maximized')) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    dragState.win.style.left = (dragState.origLeft + dx) + 'px';
    dragState.win.style.top  = (dragState.origTop + dy) + 'px';
  });

  document.addEventListener('mouseup', () => { dragState = null; });

  // Focus on click anywhere on window
  document.querySelectorAll('.window').forEach(w => {
    w.addEventListener('mousedown', () => focusWin(w));
  });
}

// ───────────── Utility ─────────────
function toggleEl(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
}
function fmt(dateStr) {
  if (!dateStr) return '—';
  try { // إضافة try-catch للتعامل مع تواريخ غير صالحة
    return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    console.warn("Invalid date string for fmt:", dateStr);
    return '—';
  }
}
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}
function setSelect(selId, items, selectedId = null) { // Added selectedId parameter
  const sel = document.getElementById(selId);
  if (!sel) return;
  const current = selectedId || sel.value; // Use selectedId if provided, otherwise current value
  sel.innerHTML = '<option value="">— اختر مريضاً —</option>' +
    items.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
  if (current) sel.value = current;
}


// ───────────── Dashboard ─────────────
async function loadDashboard() {
  try {
    const allPatients = getFromLocalStorage('patients');
    const allPrescriptions = getFromLocalStorage('prescriptions');
    const allLabResults = getFromLocalStorage('lab_results');
    const allActivities = getFromLocalStorage('activities');
    const allVisits = getFromLocalStorage('visits'); 

    // Calculate totals
    const totalPatients = allPatients.length;
    const totalPrescriptions = allPrescriptions.length;
    const totalLabResults = allLabResults.length;
    const totalVisits = allVisits.length; 

    // Recent patients (e.g., added in the last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentPatients = allPatients.filter(p => new Date(p.createdAt) > oneWeekAgo).length;

    // Abnormal lab results
    const abnormalLabResults = allLabResults.filter(lab => lab.status === 'abnormal').length;
    
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '0'; };
    set('s-patients', totalPatients);
    set('s-rx', totalPrescriptions);
    set('s-labs', totalLabResults);
    set('s-visits', totalVisits);
    set('s-recent', recentPatients);
    set('s-abnormal', abnormalLabResults);
  } catch (e) { console.error('Dashboard error:', e); }
}

// ───────────── Patients ─────────────
async function loadPatients() {
  try {
    const data = getFromLocalStorage('patients'); // جلب المرضى من localStorage
    patients = data || [];
    patientMap = {};
    patients.forEach(p => { patientMap[p._id] = p; });
    
    const selIds = ['sel-patient', 'rx-patient', 'lab-filter', 'lab-patient', 'vp-patient', 'sos-sel'];
    selIds.forEach(id => setSelect(id, patients));

  } catch (e) { console.error('Patients error:', e); }
}

function selectPatient(id) {
  if (!id) {
    document.getElementById('patient-card').classList.add('hidden'); // إخفاء الكارت لو مفيش مريض مختار
    document.getElementById('p-visits').innerHTML = ''; // مسح الزيارات
    if (vitalsChart) vitalsChart.destroy(); // مسح الـ chart
    return;
  }
  // Sync all patient selects
  ['sel-patient', 'rx-patient', 'vp-patient', 'lab-filter', 'lab-patient', 'sos-sel'].forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.value = id;
  });
  renderPatientCard(id);
  loadVisits(id);
  loadVitals();
  renderSOS(); // لتحديث بيانات الطوارئ إذا كانت النافذة مفتوحة
}


function renderPatientCard(id) {
  const p = patientMap[id];
  if (!p) return;
  document.getElementById('patient-card').classList.remove('hidden');
  const initial = (p.name || 'م')[0];
  document.getElementById('p-avatar').textContent = initial;
  document.getElementById('p-name').textContent = p.name || '—';
  document.getElementById('p-nid').textContent = 'الرقم القومي: ' + (p.nationalId || '—');
  document.getElementById('p-dob').textContent = 'تاريخ الميلاد: ' + fmt(p.dateOfBirth) + (p.gender === 'male' ? ' · ذكر' : ' · أنثى');
  document.getElementById('p-blood').textContent = p.bloodType || '—';

  const allergiesEl = document.getElementById('p-allergies');
  const allergies = p.allergies || [];
  allergiesEl.innerHTML = allergies.length
    ? allergies.map(a => `<span class="tag">${a}</span>`).join('')
    : '<span style="color:var(--sub);font-size:12px">لا توجد حساسية مسجلة</span>';

  const chronicEl = document.getElementById('p-chronic');
  const chronic = p.chronicDiseases || [];
  chronicEl.innerHTML = chronic.length
    ? chronic.map(c => `<span class="tag chronic">${c}</span>`).join('')
    : '<span style="color:var(--sub);font-size:12px">لا توجد أمراض مزمنة مسجلة</span>';
}

async function loadVisits(patientId) {
  if (!patientId) return;
  try {
    // جلب الزيارات الحقيقية من localStorage
    const realVisits = getFromLocalStorage('visits').filter(v => v.patientId === patientId);

    // دمج الروشتات والتحاليل كزيارات افتراضية (لو مفيش visits حقيقية كافية أو لتكملة البيانات)
    const allPrescriptions = getFromLocalStorage('prescriptions');
    const patientPrescriptions = allPrescriptions.filter(rx => rx.patientId === patientId);

    const allLabResults = getFromLocalStorage('lab_results');
    const patientLabResults = allLabResults.filter(lab => lab.patientId === patientId);

    const syntheticVisits = [
        ...patientPrescriptions.map(rx => ({
            _id: rx._id + '_rx', // عشان مفيش تكرار في الـ ID
            visitDate: rx.createdAt,
            chiefComplaint: 'روشتة صادرة',
            reason: 'متابعة طبية',
            attendingPhysician: rx.prescribedBy || 'غير معروف'
        })),
        ...patientLabResults.map(lab => ({
            _id: lab._id + '_lab', // عشان مفيش تكرار في الـ ID
            visitDate: lab.createdAt,
            chiefComplaint: 'نتيجة تحليل',
            reason: lab.testName,
            attendingPhysician: 'المعمل'
        }))
    ];

    // دمج الزيارات الحقيقية مع الزيارات الافتراضية وترتيبها
    const visits = [...realVisits, ...syntheticVisits].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));


    const el = document.getElementById('p-visits');
    if (!el) return;
    if (!visits.length) { el.innerHTML = '<div style="color:var(--sub);font-size:12px">لا توجد زيارات</div>'; return; }
    el.innerHTML = visits.map(v => `
      <div class="visit-item">
        <div class="v-date">${fmt(v.visitDate)}</div>
        <div class="v-reason">${v.chiefComplaint || v.reason || '—'}</div>
        <div class="v-doc">&#128100; ${v.attendingPhysician || v.doctor || '—'}</div>
      </div>
    `).join('');
  } catch (e) { console.error('Visits error:', e); }
}

async function addPatient() {
  const name = document.getElementById('np-name').value.trim();
  if (!name) { 
    toast('⚠️ يرجى إدخال اسم المريض', 'error'); 
    document.getElementById('np-name').focus();
    return; 
  }
  const allergyVal = document.getElementById('np-allergy').value.trim();
  const chronicVal = document.getElementById('np-chronic').value.trim();
  
  const newPatient = {
    _id: generateId(), // توليد ID فريد للمريض الجديد
    name,
    nationalId: document.getElementById('np-nid').value.trim(),
    dateOfBirth: document.getElementById('np-dob').value,
    gender: document.getElementById('np-gender').value,
    bloodType: document.getElementById('np-blood').value,
    phone: document.getElementById('np-phone').value.trim(),
    allergies: allergyVal ? allergyVal.split(',').map(s => s.trim()).filter(Boolean) : [],
    chronicDiseases: chronicVal ? chronicVal.split(',').map(s => s.trim()).filter(Boolean) : [],
    createdAt: new Date().toISOString() // إضافة تاريخ الإنشاء
  };

  try {
    const allPatients = getFromLocalStorage('patients');
    allPatients.push(newPatient);
    saveToLocalStorage('patients', allPatients); // حفظ المرضى الجدد في localStorage

    // إضافة نشاط جديد
    const allActivities = getFromLocalStorage('activities');
    allActivities.unshift({
        _id: generateId(),
        type: 'patient',
        patientId: newPatient._id,
        patientName: newPatient.name,
        description: 'تم إضافة مريض جديد',
        timestamp: new Date().toISOString()
    });
    saveToLocalStorage('activities', allActivities);


    toast('تم إضافة المريض بنجاح');
    document.getElementById('add-patient-form').classList.add('hidden'); // إخفاء الفورم
    document.getElementById('np-name').value = ''; // مسح الحقول
    document.getElementById('np-nid').value = '';
    document.getElementById('np-dob').value = '';
    document.getElementById('np-phone').value = '';
    document.getElementById('np-allergy').value = '';
    document.getElementById('np-chronic').value = '';
    
    await loadPatients();
    loadDashboard();
    loadActivity();
  } catch (e) { toast('خطأ: ' + e.message, 'error'); }
}

// ───────────── Prescriptions ─────────────
async function loadPrescriptions() {
  try {
    const rxs = getFromLocalStorage('prescriptions'); // جلب الروشتات من localStorage
    // ترتيب الروشتات من الأحدث للأقدم
    rxs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const el = document.getElementById('rx-list');
    if (!el) return;
    if (!rxs.length) { el.innerHTML = '<div style="color:var(--sub);font-size:12px;margin-bottom:12px">لا توجد روشتات بعد</div>'; return; }
    el.innerHTML = rxs.map(rx => {
      const p = patientMap[rx.patientId] || {}; // استخدم patientMap
      const pName = p.name || rx.patientName || 'مريض';
      const meds = rx.medications || rx.medicines || [];
      return `
        <div class="rx-item">
          <div class="rx-top">
            <span class="rx-patient-name">&#128101; ${pName}</span>
            <span class="rx-date">${fmt(rx.createdAt || rx.date)}</span>
          </div>
          <div class="rx-meds-list">
            ${meds.map(m => `
              <div class="rx-med">
                <span class="rx-med-name">${m.name || m.drugName}</span>
                <span class="rx-med-detail"> — ${m.dosage || m.dose || ''}، ${m.frequency || m.freq || ''}، ${m.duration || m.days || ''}${typeof (m.duration||m.days) === 'number' ? ' يوم' : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) { console.error('Prescriptions error:', e); }
}

function addMedRow() {
  const container = document.getElementById('rx-meds');
  const row = document.createElement('div');
  row.className = 'med-row';
  row.innerHTML = `
    <input class="inp mn" placeholder="اسم الدواء"/>
    <input class="inp md" placeholder="500mg"/>
    <input class="inp mf" placeholder="مرتين يومياً"/>
    <div style="display:flex;gap:6px;align-items:center;">
      <input class="inp my" type="number" value="30" style="flex:1;"/>
      <button type="button" onclick="this.closest('.med-row').remove()" style="background:var(--red);color:#fff;border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;" title="حذف">×</button>
    </div>
  `;
  container.appendChild(row);
  // Focus on the new medicine name input
  row.querySelector('.mn').focus();
}

function removeMedRow(btn) {
  const row = btn.closest('.med-row');
  if (row) row.remove();
}

async function issuePrescription() {
  const patientId = document.getElementById('rx-patient').value;
  const doctor = document.getElementById('rx-doctor').value.trim();
  if (!patientId) { 
    toast('⚠️ يرجى اختيار مريض', 'error'); 
    document.getElementById('rx-patient').focus();
    return; 
  }

  const rows = document.querySelectorAll('#rx-meds .med-row');
  const medications = [];
  rows.forEach(row => {
    const name = row.querySelector('.mn').value.trim();
    const dosage = row.querySelector('.md').value.trim();
    const frequency = row.querySelector('.mf').value.trim();
    const duration = parseInt(row.querySelector('.my').value) || 30;
    if (name) medications.push({ name, dosage, frequency, duration });
  });
  if (!medications.length) { 
    toast('⚠️ يرجى إضافة دواء واحد على الأقل', 'error'); 
    return; 
  }

  const newPrescription = {
    _id: generateId(),
    patientId,
    patientName: patientMap[patientId] ? patientMap[patientId].name : 'غير معروف',
    prescribedBy: doctor,
    medications,
    createdAt: new Date().toISOString()
  };

  try {
    const allPrescriptions = getFromLocalStorage('prescriptions');
    allPrescriptions.unshift(newPrescription); // أضف الروشتة الجديدة في البداية
    saveToLocalStorage('prescriptions', allPrescriptions);

    // إضافة نشاط جديد
    const allActivities = getFromLocalStorage('activities');
    allActivities.unshift({
        _id: generateId(),
        type: 'prescription',
        patientId: patientId,
        patientName: newPrescription.patientName,
        description: `روشتة لـ ${medications.length} أدوية`,
        timestamp: new Date().toISOString()
    });
    saveToLocalStorage('activities', allActivities);


    // لا يوجد تحقق من التفاعلات الدوائية حاليًا بدون API
    const alertEl = document.getElementById('rx-alert');
    if (alertEl) alertEl.classList.add('hidden'); // إخفاء التنبيه

    toast('تم إصدار الروشتة بنجاح');
    // Reset form
    document.getElementById('rx-meds').innerHTML = `
      <div class="med-header"><span>الدواء</span><span>الجرعة</span><span>التكرار</span><span>أيام</span></div>
      <div class="med-row">
        <input class="inp mn" placeholder="اسم الدواء"/>
        <input class="inp md" placeholder="500mg"/>
        <input class="inp mf" placeholder="مرتين يومياً"/>
        <input class="inp my" type="number" value="30"/>
      </div>`;
    await loadPrescriptions();
    loadDashboard();
    loadActivity();
  } catch (e) { toast('خطأ: ' + e.message, 'error'); }
}

// ───────────── Lab Results ─────────────
const labIcons = { blood: '&#128300;', urine: '&#128167;', radiology: '&#9728;', mri: '&#127775;', xray: '&#128246;', ultrasound: '&#128251;', other: '&#128203;' };
const labLabels = { blood: 'تحليل دم', urine: 'تحليل بول', radiology: 'أشعة', mri: 'رنين مغناطيسي', xray: 'أشعة سينية', ultrasound: 'موجات صوتية', other: 'أخرى' };

async function loadLabs() {
  try {
    let labs = getFromLocalStorage('lab_results'); // جلب التحاليل من localStorage
    const filterId = document.getElementById('lab-filter').value;
    if (filterId) {
        labs = labs.filter(lab => lab.patientId === filterId);
    }
    // ترتيب التحاليل من الأحدث للأقدم
    labs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const el = document.getElementById('lab-list');
    if (!el) return;
    if (!labs.length) { el.innerHTML = '<div style="color:var(--sub);font-size:12px;margin-bottom:12px">لا توجد نتائج</div>'; return; }
    el.innerHTML = labs.map(lab => {
      const p = patientMap[lab.patientId] || {};
      const pName = p.name || 'مريض';
      const icon = labIcons[lab.type] || labIcons.other;
      const typeLbl = labLabels[lab.type] || 'أخرى';
      const statusClass = lab.status === 'normal' ? 'normal' : lab.status === 'abnormal' ? 'abnormal' : 'pending';
      const statusLbl = lab.status === 'normal' ? 'طبيعي' : lab.status === 'abnormal' ? 'غير طبيعي' : 'قيد الانتظار';
      return `
        <div class="lab-item">
          <div class="lab-icon">${icon}</div>
          <div class="lab-info">
            <div class="lab-name">${lab.testName || lab.name}</div>
            <div class="lab-sub">&#128101; ${pName} · ${typeLbl} · ${fmt(lab.testDate || lab.date || lab.createdAt)}</div>
          </div>
          <span class="lab-badge ${statusClass}">${statusLbl}</span>
        </div>
      `;
    }).join('');
  } catch (e) { console.error('Labs error:', e); }
}

async function uploadLab() {
  const patientId = document.getElementById('lab-patient').value;
  const name = document.getElementById('lab-name').value.trim();
  if (!patientId) { 
    toast('⚠️ يرجى اختيار مريض', 'error'); 
    document.getElementById('lab-patient').focus();
    return; 
  }
  if (!name) { 
    toast('⚠️ يرجى إدخال اسم التقرير', 'error'); 
    document.getElementById('lab-name').focus();
    return; 
  }
  
  const newLabResult = {
    _id: generateId(),
    patientId,
    patientName: patientMap[patientId] ? patientMap[patientId].name : 'غير معروف',
    testName: name,
    type: document.getElementById('lab-type').value,
    status: document.getElementById('lab-status').value,
    testDate: document.getElementById('lab-date').value || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };

  try {
    const allLabResults = getFromLocalStorage('lab_results');
    allLabResults.unshift(newLabResult); // أضف النتيجة الجديدة في البداية
    saveToLocalStorage('lab_results', allLabResults);

    // إضافة نشاط جديد
    const allActivities = getFromLocalStorage('activities');
    allActivities.unshift({
        _id: generateId(),
        type: 'lab_result',
        patientId: patientId,
        patientName: newLabResult.patientName,
        description: `نتيجة تحليل ${newLabResult.testName}`,
        timestamp: new Date().toISOString()
    });
    saveToLocalStorage('activities', allActivities);


    toast('تم رفع النتيجة بنجاح');
    document.getElementById('lab-name').value = '';
    await loadLabs();
    loadDashboard();
    loadActivity();
  } catch (e) { toast('خطأ: ' + e.message, 'error'); }
}

// ───────────── Vital Signs Chart ─────────────
async function loadVitals() {
  const patientId = document.getElementById('vp-patient').value;
  const period = document.getElementById('vp-period').value;
  if (!patientId) {
      if (vitalsChart) vitalsChart.destroy();
      return;
  }

  try {
    let records = getFromLocalStorage('vital_signs'); // جلب العلامات الحيوية من localStorage
    records = records.filter(r => r.patientId === patientId);

    // Filter by period (mocking) - this needs actual dates in records
    const now = new Date();
    if (period === 'weekly') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        records = records.filter(r => new Date(r.recordedAt) >= oneWeekAgo);
    } else if (period === 'monthly') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        records = records.filter(r => new Date(r.recordedAt) >= oneMonthAgo);
    }
    
    // Sort records by date ascending for chart
    records.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

    if (!records.length) {
        if (vitalsChart) vitalsChart.destroy();
        const ctx = document.getElementById('vitals-chart');
        if (ctx) { // clear chart area
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            // Optionally display a message
            const parent = ctx.parentElement;
            if (parent && !parent.querySelector('.no-data-message')) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'no-data-message';
                msgDiv.style.cssText = "color:var(--sub);text-align:center;padding:20px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);";
                msgDiv.textContent = 'لا توجد بيانات علامات حيوية لهذا المريض';
                parent.style.position = 'relative'; // ensure parent is positioned
                parent.appendChild(msgDiv);
            }
        }
        return;
    } else {
        // Remove no-data message if records are present
        const ctx = document.getElementById('vitals-chart');
        const msgDiv = ctx ? ctx.parentElement.querySelector('.no-data-message') : null;
        if (msgDiv) msgDiv.remove();
    }


    const labels = records.map(r => {
      const d = new Date(r.recordedAt || r.date || r.createdAt);
      return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    });

    const systolic = records.map(r => r.bloodPressure?.systolic || r.systolic || null);
    const heartRate = records.map(r => r.heartRate || r.pulse || null);
    const bloodSugar = records.map(r => r.bloodSugar || r.glucose || null);

    const ctx = document.getElementById('vitals-chart');
    if (!ctx) return;

    if (vitalsChart) vitalsChart.destroy();
    vitalsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'ضغط انقباضي',
            data: systolic,
            borderColor: '#1A73E8',
            backgroundColor: 'rgba(26,115,232,0.08)',
            tension: 0.4,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'نبض القلب',
            data: heartRate,
            borderColor: '#34A853',
            backgroundColor: 'rgba(52,168,83,0.06)',
            tension: 0.4,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'سكر الدم',
            data: bloodSugar,
            borderColor: '#FBBC04',
            backgroundColor: 'rgba(251,188,4,0.06)',
            tension: 0.4,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            rtl: true,
            titleFont: { family: 'Cairo' },
            bodyFont: { family: 'Cairo' },
          },
        },
        scales: {
          x: {
            ticks: { font: { family: 'Cairo', size: 10 }, maxRotation: 45 },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          y: {
            ticks: { font: { family: 'Cairo', size: 10 } },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
        },
      },
    });
  } catch (e) { console.error('Vitals error:', e); }
}

// ───────────── Dashboard Expanded Views ─────────────
let currentModalPatientId = null;
let currentModalLabId = null;
let currentModalRxId = null;

function openDashboardExpanded(type) {
  // Close all expanded sections first
  ['patients', 'labs', 'weekly', 'rx', 'visits', 'abnormal'].forEach(t => {
    document.getElementById(`dashboard-${t}-expanded`).classList.add('hidden');
  });
  
  // Open the requested section
  const section = document.getElementById(`dashboard-${type}-expanded`);
  section.classList.remove('hidden');
  
  // Load the data
  switch(type) {
    case 'patients':
      loadDashboardPatientsList();
      break;
    case 'labs':
      loadDashboardLabsList();
      break;
    case 'weekly':
      loadDashboardWeeklyList();
      break;
    case 'rx':
      loadDashboardRxList();
      break;
    case 'visits':
      loadDashboardVisitsList();
      break;
    case 'abnormal':
      loadDashboardAbnormalList();
      break;
  }
}

function closeDashboardExpanded(type) {
  document.getElementById(`dashboard-${type}-expanded`).classList.add('hidden');
}

// Load all patients list in dashboard
function loadDashboardPatientsList() {
  const allPatients = getFromLocalStorage('patients');
  const el = document.getElementById('dashboard-patients-list');
  
  if (!allPatients.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--sub)">لا يوجد مرضى مسجلين</div>';
    return;
  }
  
  // Sort by creation date (newest first)
  allPatients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  el.innerHTML = allPatients.map(p => `
    <div class="dashboard-list-item" onclick="showPatientDetail('${p._id}')">
      <span class="item-name">👤 ${p.name}</span>
      <span class="item-date">${fmt(p.createdAt)}</span>
    </div>
  `).join('');
}

// Load all labs list in dashboard
function loadDashboardLabsList() {
  const allLabs = getFromLocalStorage('lab_results');
  const el = document.getElementById('dashboard-labs-list');
  
  if (!allLabs.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--sub)">لا توجد تحاليل</div>';
    return;
  }
  
  // Sort by date (newest first)
  allLabs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  el.innerHTML = allLabs.map(lab => {
    const p = patientMap[lab.patientId] || {};
    const statusClass = lab.status || 'pending';
    return `
    <div class="dashboard-list-item" onclick="showLabDetail('${lab._id}')">
      <span class="item-name">🔬 ${lab.testName}</span>
      <span class="item-status ${statusClass}">${lab.status === 'normal' ? 'طبيعي' : lab.status === 'abnormal' ? 'غير طبيعي' : 'قيد الانتظار'}</span>
      <span class="item-date">👤 ${p.name || 'مريض'} · ${fmt(lab.createdAt)}</span>
    </div>
  `}).join('');
}

// Load weekly patients list
function loadDashboardWeeklyList() {
  const allPatients = getFromLocalStorage('patients');
  const el = document.getElementById('dashboard-weekly-list');
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyPatients = allPatients.filter(p => new Date(p.createdAt) > oneWeekAgo);
  
  if (!weeklyPatients.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--sub)">لا يوجد مرضى جدد هذا الأسبوع</div>';
    return;
  }
  
  // Sort by creation date (newest first)
  weeklyPatients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  el.innerHTML = weeklyPatients.map(p => `
    <div class="dashboard-list-item" onclick="showPatientDetail('${p._id}')">
      <span class="item-name">👤 ${p.name}</span>
      <span class="item-date">${fmt(p.createdAt)}</span>
    </div>
  `).join('');
}

// Load prescriptions list
function loadDashboardRxList() {
  const allRxs = getFromLocalStorage('prescriptions');
  const el = document.getElementById('dashboard-rx-list');
  
  if (!allRxs.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--sub)">لا توجد روشتات</div>';
    return;
  }
  
  // Sort by date (newest first)
  allRxs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  el.innerHTML = allRxs.map(rx => {
    const p = patientMap[rx.patientId] || {};
    const medCount = (rx.medications || []).length;
    return `
    <div class="dashboard-list-item" onclick="showRxDetail('${rx._id}')">
      <span class="item-name">💊 روشتة (${medCount} أدوية)</span>
      <span class="item-date">👤 ${p.name || 'مريض'} · ${fmt(rx.createdAt)}</span>
    </div>
  `}).join('');
}

// Load today's visits
function loadDashboardVisitsList() {
  const allVisits = getFromLocalStorage('visits');
  const el = document.getElementById('dashboard-visits-list');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayVisits = allVisits.filter(v => {
    const visitDate = new Date(v.visitDate || v.createdAt);
    return visitDate >= today && visitDate < tomorrow;
  });
  
  if (!todayVisits.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--sub)">لا توجد زيارات اليوم</div>';
    return;
  }
  
  // Sort by date (newest first)
  todayVisits.sort((a, b) => new Date(b.visitDate || b.createdAt) - new Date(a.visitDate || a.createdAt));
  
  el.innerHTML = todayVisits.map(v => {
    const p = patientMap[v.patientId] || {};
    return `
    <div class="dashboard-list-item" onclick="showPatientDetail('${v.patientId}')">
      <span class="item-name">🩺 ${v.chiefComplaint || 'زيارة'}</span>
      <span class="item-date">👤 ${p.name || 'مريض'} · ${fmt(v.visitDate || v.createdAt)}</span>
    </div>
  `}).join('');
}

// Load abnormal labs
function loadDashboardAbnormalList() {
  const allLabs = getFromLocalStorage('lab_results');
  const el = document.getElementById('dashboard-abnormal-list');
  
  const abnormalLabs = allLabs.filter(lab => lab.status === 'abnormal');
  
  if (!abnormalLabs.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--sub)">لا توجد تحاليل غير طبيعية</div>';
    return;
  }
  
  // Sort by date (newest first)
  abnormalLabs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  el.innerHTML = abnormalLabs.map(lab => {
    const p = patientMap[lab.patientId] || {};
    return `
    <div class="dashboard-list-item" onclick="showLabDetail('${lab._id}')" style="border-right:3px solid var(--red)">
      <span class="item-name">⚠️ ${lab.testName}</span>
      <span class="item-status abnormal">غير طبيعي</span>
      <span class="item-date">👤 ${p.name || 'مريض'} · ${fmt(lab.createdAt)}</span>
    </div>
  `}).join('');
}

// ───────────── Patient Detail Modal ─────────────
function showPatientDetail(patientId) {
  currentModalPatientId = patientId;
  const p = patientMap[patientId];
  if (!p) return;
  
  const modal = document.getElementById('patient-detail-modal');
  const title = document.getElementById('modal-patient-title');
  const content = document.getElementById('modal-patient-content');
  
  title.textContent = `معلومات المريض: ${p.name}`;
  
  const allergies = (p.allergies || []).join('، ') || 'لا يوجد';
  const chronic = (p.chronicDiseases || []).join('، ') || 'لا يوجد';
  
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="background:rgba(26,115,232,.08);padding:12px;border-radius:10px;">
        <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">الرقم القومي</div>
        <div style="font-weight:700;">${p.nationalId || '—'}</div>
      </div>
      <div style="background:rgba(234,67,53,.08);padding:12px;border-radius:10px;">
        <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">فصيلة الدم</div>
        <div style="font-weight:700;color:var(--red);">${p.bloodType || '—'}</div>
      </div>
      <div style="background:rgba(0,0,0,.04);padding:12px;border-radius:10px;">
        <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">تاريخ الميلاد</div>
        <div style="font-weight:700;">${fmt(p.dateOfBirth)}</div>
      </div>
      <div style="background:rgba(0,0,0,.04);padding:12px;border-radius:10px;">
        <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">الجنس</div>
        <div style="font-weight:700;">${p.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
      </div>
    </div>
    <div style="background:rgba(0,0,0,.04);padding:12px;border-radius:10px;margin-bottom:12px;">
      <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">الهاتف</div>
      <div style="font-weight:700;direction:ltr;text-align:right;">${p.phone || '—'}</div>
    </div>
    <div style="background:rgba(255,140,0,.08);padding:12px;border-radius:10px;margin-bottom:12px;">
      <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">الحساسية</div>
      <div style="font-weight:700;color:var(--orange);">${allergies}</div>
    </div>
    <div style="background:rgba(234,67,53,.08);padding:12px;border-radius:10px;">
      <div style="font-size:11px;color:var(--sub);margin-bottom:4px;">الأمراض المزمنة</div>
      <div style="font-weight:700;color:var(--red);">${chronic}</div>
    </div>
    <div style="margin-top:12px;font-size:11px;color:var(--sub);text-align:center;">
      تاريخ الإضافة: ${fmt(p.createdAt)}
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function closePatientDetailModal() {
  document.getElementById('patient-detail-modal').classList.add('hidden');
  currentModalPatientId = null;
}

function editPatientFromModal() {
  if (!currentModalPatientId) return;
  closePatientDetailModal();
  
  const p = patientMap[currentModalPatientId];
  if (!p) return;
  
  document.getElementById('edit-patient-id').value = p._id;
  document.getElementById('edit-p-name').value = p.name || '';
  document.getElementById('edit-p-nid').value = p.nationalId || '';
  document.getElementById('edit-p-dob').value = p.dateOfBirth || '';
  document.getElementById('edit-p-gender').value = p.gender || 'male';
  document.getElementById('edit-p-blood').value = p.bloodType || 'A+';
  document.getElementById('edit-p-phone').value = p.phone || '';
  document.getElementById('edit-p-allergy').value = (p.allergies || []).join(', ');
  document.getElementById('edit-p-chronic').value = (p.chronicDiseases || []).join(', ');
  
  document.getElementById('edit-patient-modal').classList.remove('hidden');
}

function closeEditPatientModal() {
  document.getElementById('edit-patient-modal').classList.add('hidden');
}

function saveEditPatient() {
  const id = document.getElementById('edit-patient-id').value;
  if (!id) return;
  
  // Validate required fields
  const name = document.getElementById('edit-p-name').value.trim();
  if (!name) {
    toast('⚠️ الاسم مطلوب', 'error');
    document.getElementById('edit-p-name').focus();
    return;
  }
  
  const allPatients = getFromLocalStorage('patients');
  const idx = allPatients.findIndex(p => p._id === id);
  if (idx === -1) return;
  
  const allergyVal = document.getElementById('edit-p-allergy').value.trim();
  const chronicVal = document.getElementById('edit-p-chronic').value.trim();
  
  allPatients[idx] = {
    ...allPatients[idx],
    name: name,
    nationalId: document.getElementById('edit-p-nid').value.trim(),
    dateOfBirth: document.getElementById('edit-p-dob').value,
    gender: document.getElementById('edit-p-gender').value,
    bloodType: document.getElementById('edit-p-blood').value,
    phone: document.getElementById('edit-p-phone').value.trim(),
    allergies: allergyVal ? allergyVal.split(',').map(s => s.trim()).filter(Boolean) : [],
    chronicDiseases: chronicVal ? chronicVal.split(',').map(s => s.trim()).filter(Boolean) : []
  };
  
  saveToLocalStorage('patients', allPatients);
  patientMap[id] = allPatients[idx];
  
  // Update patient card if currently selected
  const currentSel = document.getElementById('sel-patient').value;
  if (currentSel === id) {
    renderPatientCard(id);
    loadVisits(id);
  }
  
  toast('✅ تم تحديث بيانات المريض بنجاح');
  closeEditPatientModal();
  loadPatients();
  loadDashboard();
  loadActivity();
  
  // Refresh dashboard lists if open
  loadDashboardPatientsList();
  loadDashboardWeeklyList();
}

function deletePatientFromModal() {
  if (!currentModalPatientId) return;
  
  if (!confirm('هل أنت متأكد من حذف هذا المريض؟ لا يمكن التراجع عن هذا الإجراء.')) {
    return;
  }
  
  let allPatients = getFromLocalStorage('patients');
  allPatients = allPatients.filter(p => p._id !== currentModalPatientId);
  saveToLocalStorage('patients', allPatients);
  
  // Also delete related data
  let allPrescriptions = getFromLocalStorage('prescriptions');
  allPrescriptions = allPrescriptions.filter(rx => rx.patientId !== currentModalPatientId);
  saveToLocalStorage('prescriptions', allPrescriptions);
  
  let allLabs = getFromLocalStorage('lab_results');
  allLabs = allLabs.filter(lab => lab.patientId !== currentModalPatientId);
  saveToLocalStorage('lab_results', allLabs);
  
  let allVisits = getFromLocalStorage('visits');
  allVisits = allVisits.filter(v => v.patientId !== currentModalPatientId);
  saveToLocalStorage('visits', allVisits);
  
  delete patientMap[currentModalPatientId];
  
  toast('تم حذف المريض بنجاح');
  closePatientDetailModal();
  loadPatients();
  loadDashboard();
  loadPrescriptions();
  loadLabs();
  
  // Refresh all dashboard lists
  loadDashboardPatientsList();
  loadDashboardLabsList();
  loadDashboardWeeklyList();
  loadDashboardRxList();
  loadDashboardVisitsList();
  loadDashboardAbnormalList();
}

function exportPatientPDF() {
  if (!currentModalPatientId) return;
  const p = patientMap[currentModalPatientId];
  if (!p) return;
  
  // Create PDF content
  const allergies = (p.allergies || []).join('، ') || 'لا يوجد';
  const chronic = (p.chronicDiseases || []).join('، ') || 'لا يوجد';
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير المريض - ${p.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Cairo', sans-serif; 
          padding: 40px; 
          background: #f5f5f5;
          direction: rtl;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1A73E8;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 { color: #1A73E8; font-size: 28px; margin-bottom: 10px; }
        .header p { color: #666; }
        .patient-name {
          background: #1A73E8;
          color: white;
          padding: 15px 25px;
          border-radius: 10px;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 30px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          border-right: 4px solid #1A73E8;
        }
        .info-box label {
          font-size: 12px;
          color: #666;
          display: block;
          margin-bottom: 5px;
        }
        .info-box value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .alert-box {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .alert-box.danger {
          background: #f8d7da;
          border-color: #dc3545;
        }
        .alert-box label {
          font-size: 12px;
          color: #666;
          display: block;
          margin-bottom: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 12px;
        }
        .print-date {
          text-align: left;
          color: #999;
          font-size: 11px;
          margin-top: 20px;
        }
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 HealthOS Egypt</h1>
          <p>نظام إدارة العيادات الطبية</p>
        </div>
        
        <div class="patient-name">${p.name}</div>
        
        <div class="info-grid">
          <div class="info-box">
            <label>الرقم القومي</label>
            <value>${p.nationalId || '—'}</value>
          </div>
          <div class="info-box">
            <label>فصيلة الدم</label>
            <value style="color:#dc3545;font-weight:700;">${p.bloodType || '—'}</value>
          </div>
          <div class="info-box">
            <label>تاريخ الميلاد</label>
            <value>${fmt(p.dateOfBirth)}</value>
          </div>
          <div class="info-box">
            <label>الجنس</label>
            <value>${p.gender === 'male' ? 'ذكر' : 'أنثى'}</value>
          </div>
          <div class="info-box">
            <label>رقم الهاتف</label>
            <value dir="ltr">${p.phone || '—'}</value>
          </div>
          <div class="info-box">
            <label>تاريخ التسجيل</label>
            <value>${fmt(p.createdAt)}</value>
          </div>
        </div>
        
        <div class="alert-box ${(p.allergies || []).length ? 'danger' : ''}">
          <label>⚠️ الحساسية</label>
          <value style="font-weight:600;">${allergies}</value>
        </div>
        
        <div class="alert-box danger">
          <label>🩺 الأمراض المزمنة</label>
          <value style="font-weight:600;">${chronic}</value>
        </div>
        
        <div class="footer">
          <p>هذا التقرير تم إنشاؤه إلكترونياً من نظام HealthOS Egypt</p>
          <p>يرجى استشارة الطبيب المعالج للحصول على التشخيص والعلاج المناسب</p>
        </div>
        
        <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ───────────── Lab Detail Modal ─────────────
function showLabDetail(labId) {
  currentModalLabId = labId;
  const allLabs = getFromLocalStorage('lab_results');
  const lab = allLabs.find(l => l._id === labId);
  if (!lab) return;
  
  const p = patientMap[lab.patientId] || {};
  const modal = document.getElementById('lab-detail-modal');
  const title = document.getElementById('modal-lab-title');
  const content = document.getElementById('modal-lab-content');
  
  title.textContent = `تفاصيل التحليل: ${lab.testName}`;
  
  const labLabels = { blood: 'تحليل دم', urine: 'تحليل بول', radiology: 'أشعة', mri: 'رنين مغناطيسي', xray: 'أشعة سينية', ultrasound: 'موجات صوتية', other: 'أخرى' };
  const statusText = lab.status === 'normal' ? 'طبيعي' : lab.status === 'abnormal' ? 'غير طبيعي' : 'قيد الانتظار';
  
  content.innerHTML = `
    <div class="lab-detail-item">
      <div class="lab-detail-header">
        <div class="lab-detail-title">${lab.testName}</div>
        <span class="lab-badge ${lab.status || 'pending'}">${statusText}</span>
      </div>
      <div class="lab-detail-patient">👤 ${p.name || 'غير معروف'}</div>
      <div class="lab-detail-info" style="margin-top:12px;">
        <span>🔬 النوع: ${labLabels[lab.type] || 'أخرى'}</span>
        <span>📅 التاريخ: ${fmt(lab.testDate || lab.createdAt)}</span>
        <span>🕐 الإضافة: ${fmt(lab.createdAt)}</span>
      </div>
    </div>
    <div class="action-buttons">
      <button class="btn-edit" onclick="editLabFromModal()">✏️ تعديل</button>
      <button class="btn-delete" onclick="deleteLabFromModal()">🗑️ حذف</button>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function closeLabDetailModal() {
  document.getElementById('lab-detail-modal').classList.add('hidden');
  currentModalLabId = null;
}

function editLabFromModal() {
  if (!currentModalLabId) return;
  closeLabDetailModal();
  
  const allLabs = getFromLocalStorage('lab_results');
  const lab = allLabs.find(l => l._id === currentModalLabId);
  if (!lab) return;
  
  document.getElementById('edit-lab-id').value = lab._id;
  document.getElementById('edit-lab-name').value = lab.testName || '';
  document.getElementById('edit-lab-type').value = lab.type || 'blood';
  document.getElementById('edit-lab-status').value = lab.status || 'normal';
  document.getElementById('edit-lab-date').value = (lab.testDate || lab.createdAt || '').slice(0, 10);
  
  document.getElementById('edit-lab-modal').classList.remove('hidden');
}

function closeEditLabModal() {
  document.getElementById('edit-lab-modal').classList.add('hidden');
}

function saveEditLab() {
  const id = document.getElementById('edit-lab-id').value;
  if (!id) return;
  
  let allLabs = getFromLocalStorage('lab_results');
  const idx = allLabs.findIndex(l => l._id === id);
  if (idx === -1) return;
  
  allLabs[idx] = {
    ...allLabs[idx],
    testName: document.getElementById('edit-lab-name').value.trim(),
    type: document.getElementById('edit-lab-type').value,
    status: document.getElementById('edit-lab-status').value,
    testDate: document.getElementById('edit-lab-date').value || new Date().toISOString().slice(0, 10)
  };
  
  saveToLocalStorage('lab_results', allLabs);
  toast('✅ تم تحديث التحليل بنجاح');
  closeEditLabModal();
  loadLabs();
  loadDashboard();
}

function deleteLabFromModal() {
  if (!currentModalLabId) return;
  
  if (!confirm('⚠️ هل أنت متأكد من حذف هذا التحليل؟ لا يمكن التراجع عن هذا الإجراء.')) {
    return;
  }
  
  let allLabs = getFromLocalStorage('lab_results');
  allLabs = allLabs.filter(l => l._id !== currentModalLabId);
  saveToLocalStorage('lab_results', allLabs);
  
  toast('تم حذف التحليل بنجاح');
  closeLabDetailModal();
  loadLabs();
  loadDashboard();
  loadActivity();
}

// ───────────── Prescription Detail Modal ─────────────
function showRxDetail(rxId) {
  currentModalRxId = rxId;
  const allRxs = getFromLocalStorage('prescriptions');
  const rx = allRxs.find(r => r._id === rxId);
  if (!rx) return;
  
  const p = patientMap[rx.patientId] || {};
  const modal = document.getElementById('rx-detail-modal');
  const title = document.getElementById('modal-rx-title');
  const content = document.getElementById('modal-rx-content');
  
  title.textContent = 'تفاصيل الروشتة';
  
  const meds = (rx.medications || []).map(m => `
    <div class="rx-med-detail-item">
      <span><strong>${m.name}</strong></span>
      <span style="color:var(--sub);">${m.dosage || ''} · ${m.frequency || ''} · ${m.duration || ''} يوم</span>
    </div>
  `).join('');
  
  content.innerHTML = `
    <div class="rx-detail-item">
      <div class="rx-detail-header">
        <div class="rx-detail-patient">👤 ${p.name || rx.patientName || 'غير معروف'}</div>
        <div class="rx-detail-date">📅 ${fmt(rx.createdAt)}</div>
      </div>
      <div class="rx-detail-doctor">👨‍⚕️ الطبيب: ${rx.prescribedBy || 'غير معروف'}</div>
      <div class="rx-detail-meds">
        <div style="font-size:11px;color:var(--sub);margin-bottom:8px;">💊 الأدوية:</div>
        ${meds || '<div style="color:var(--sub);">لا توجد أدوية مسجلة</div>'}
      </div>
    </div>
    <div class="action-buttons">
      <button class="btn-export" onclick="exportRxPDF()">📄 تصدير PDF</button>
      <button class="btn-delete" onclick="deleteRxFromModal()">🗑️ حذف</button>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function closeRxDetailModal() {
  document.getElementById('rx-detail-modal').classList.add('hidden');
  currentModalRxId = null;
}

function deleteRxFromModal() {
  if (!currentModalRxId) return;
  
  if (!confirm('⚠️ هل أنت متأكد من حذف هذه الروشتة؟ لا يمكن التراجع عن هذا الإجراء.')) {
    return;
  }
  
  let allRxs = getFromLocalStorage('prescriptions');
  allRxs = allRxs.filter(r => r._id !== currentModalRxId);
  saveToLocalStorage('prescriptions', allRxs);
  
  toast('تم حذف الروشتة بنجاح');
  closeRxDetailModal();
  loadPrescriptions();
  loadDashboard();
  loadActivity();
}

function exportRxPDF() {
  if (!currentModalRxId) return;
  const allRxs = getFromLocalStorage('prescriptions');
  const rx = allRxs.find(r => r._id === currentModalRxId);
  if (!rx) return;
  
  const p = patientMap[rx.patientId] || {};
  const meds = (rx.medications || []).map(m => `
    <tr>
      <td style="padding:10px;border:1px solid #ddd;font-weight:600;">${m.name}</td>
      <td style="padding:10px;border:1px solid #ddd;">${m.dosage || '-'}</td>
      <td style="padding:10px;border:1px solid #ddd;">${m.frequency || '-'}</td>
      <td style="padding:10px;border:1px solid #ddd;">${m.duration || '-'} يوم</td>
    </tr>
  `).join('');
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>روشتة - ${p.name || 'مريض'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Cairo', sans-serif; 
          padding: 40px; 
          background: #f5f5f5;
          direction: rtl;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #34A853;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 { color: #34A853; font-size: 28px; margin-bottom: 10px; }
        .patient-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .patient-name { font-size: 18px; font-weight: 700; color: #1a2030; }
        .doctor { color: #5f6b7a; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #34A853; color: white; padding: 12px; text-align: right; }
        td { text-align: right; }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
        .rx-date { text-align: left; color: #999; font-size: 12px; margin-top: 15px; }
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 HealthOS Egypt - روشتة طبية</h1>
          <p>نظام إدارة العيادات الطبية</p>
        </div>
        
        <div class="patient-info">
          <div class="patient-name">👤 ${p.name || 'مريض'}</div>
          <div class="doctor">👨‍⚕️ الطبيب: ${rx.prescribedBy || 'غير معروف'}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>الدواء</th>
              <th>الجرعة</th>
              <th>التكرار</th>
              <th>المدة</th>
            </tr>
          </thead>
          <tbody>
            ${meds || '<tr><td colspan="4" style="text-align:center;padding:20px;">لا توجد أدوية</td></tr>'}
          </tbody>
        </table>
        
        <div class="footer">
          <p>هذه الروشتة تم إنشاؤها إلكترونياً من نظام HealthOS Egypt</p>
          <p>يرجى استشارة الطبيب للحصول على التشخيص والعلاج المناسب</p>
        </div>
        
        <div class="rx-date">تاريخ الروشتة: ${fmt(rx.createdAt)}</div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ───────────── Activity Feed ─────────────
const actColors = { patient: '#1A73E8', prescription: '#34A853', lab_result: '#7B2FBE', vital_signs: '#00897B', visit: '#FF8C00' };
const actLabels = { patient: 'مريض جديد', prescription: 'روشتة جديدة', lab_result: 'نتيجة تحليل', vital_signs: 'علامات حيوية', visit: 'زيارة' };

async function loadActivity() {
  try {
    const items = getFromLocalStorage('activities'); // جلب الأنشطة من localStorage
    // ترتيب الأنشطة من الأحدث للأقدم
    items.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
    
    // حد 15 عنصر فقط
    const recentItems = items.slice(0, 15);

    const el = document.getElementById('activity-list');
    if (!el) return;
    if (!recentItems.length) { el.innerHTML = '<div style="color:var(--sub);font-size:12px">لا يوجد نشاط حديث</div>'; return; }
    el.innerHTML = recentItems.map(item => {
      const color = actColors[item.type] || '#888';
      const typeLbl = actLabels[item.type] || item.type || '';
      const pName = item.patientName || item.patient || '—';
      return `
        <div class="activity-item">
          <div class="act-dot" style="background:${color}"></div>
          <div>
            <div class="act-text"><strong>${pName}</strong> — ${typeLbl}${item.description ? ': ' + item.description : ''}</div>
            <div class="act-time">${fmt(item.timestamp || item.createdAt)}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) { console.error('Activity error:', e); }
}

// ───────────── SOS ─────────────
function showSOS() {
  // Populate SOS selector
  const sel = document.getElementById('sos-sel');
  setSelect('sos-sel', patients, document.getElementById('sel-patient').value); // Use setSelect and try to pre-select current patient
  renderSOS(); // Render SOS info for the selected patient
  document.getElementById('sos-overlay').classList.remove('hidden');
}
function closeSOS() {
  document.getElementById('sos-overlay').classList.add('hidden');
}
function renderSOS() {
  const id = document.getElementById('sos-sel').value;
  const p = patientMap[id];
  const el = document.getElementById('sos-info');
  if (!p) { el.innerHTML = ''; return; }
  const allergies = (p.allergies || []).join('، ') || 'لا يوجد';
  const chronic = (p.chronicDiseases || []).join('، ') || 'لا يوجد';
  el.innerHTML = `
    <div class="sos-row"><span class="sk">الاسم</span><span class="sv">${p.name || '—'}</span></div>
    <div class="sos-row"><span class="sk">فصيلة الدم</span><span class="sv" style="color:var(--red)">${p.bloodType || '—'}</span></div>
    <div class="sos-row"><span class="sk">الجنس</span><span class="sv">${p.gender === 'male' ? 'ذكر' : 'أنثى'}</span></div>
    <div class="sos-row"><span class="sk">الحساسية</span><span class="sv" style="color:var(--orange)">${allergies}</span></div>
    <div class="sos-row"><span class="sk">الأمراض المزمنة</span><span class="sv">${chronic}</span></div>
    <div class="sos-row"><span class="sk">الهاتف</span><span class="sv">${p.phone || p.contactNumber || '—'}</span></div>
    <div class="sos-row"><span class="sk">تاريخ الميلاد</span><span class="sv">${fmt(p.dateOfBirth)}</span></div>
  `;
}

// ───────────── Keyboard Support ─────────────
document.addEventListener('keydown', (e) => {
  // ESC key closes open modals
  if (e.key === 'Escape') {
    // Close modals in reverse order of priority
    if (!document.getElementById('edit-lab-modal').classList.contains('hidden')) {
      closeEditLabModal();
      return;
    }
    if (!document.getElementById('edit-patient-modal').classList.contains('hidden')) {
      closeEditPatientModal();
      return;
    }
    if (!document.getElementById('patient-detail-modal').classList.contains('hidden')) {
      closePatientDetailModal();
      return;
    }
    if (!document.getElementById('lab-detail-modal').classList.contains('hidden')) {
      closeLabDetailModal();
      return;
    }
    if (!document.getElementById('rx-detail-modal').classList.contains('hidden')) {
      closeRxDetailModal();
      return;
    }
    if (!document.getElementById('sos-overlay').classList.contains('hidden')) {
      closeSOS();
      return;
    }
  }
  
  // Enter key in modals triggers save
  if (e.key === 'Enter' && e.ctrlKey) {
    if (!document.getElementById('edit-lab-modal').classList.contains('hidden')) {
      saveEditLab();
      return;
    }
    if (!document.getElementById('edit-patient-modal').classList.contains('hidden')) {
      saveEditPatient();
      return;
    }
  }
});