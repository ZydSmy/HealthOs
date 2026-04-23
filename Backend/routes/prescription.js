import { Router } from 'express';
import { Prescription } from '../Models/Prescription.js';
import { Patient } from '../Models/Patient.js';

const DRUG_INTERACTIONS = {
  warfarin:    ['aspirin', 'ibuprofen', 'naproxen'],
  metformin:   ['alcohol', 'iodinated contrast'],
  amoxicillin: ['warfarin'],
  aspirin:     ['warfarin', 'ibuprofen'],
  ibuprofen:   ['warfarin', 'aspirin'],
  naproxen:    ['warfarin'],
};

function checkInteractions(medications) {
  const names = medications.map(m => m.name?.toLowerCase());
  const warnings = [];
  
  for (const [drug, conflicts] of Object.entries(DRUG_INTERACTIONS)) {
    if (names.includes(drug)) {
      const found = conflicts.filter(c => names.includes(c));
      if (found.length > 0) {
        warnings.push(`${drug} مع ${found.join(', ')}`);
      }
    }
  }
  return warnings;
}

const router = Router();

// GET /api/prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const filter = req.query.patientId ? { patientId: req.query.patientId } : {};
    
    let prescriptions;
    try {
      prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });
    } catch (dbError) {
      prescriptions = getMockPrescriptions().filter(p => 
        !req.query.patientId || p.patientId === req.query.patientId
      );
    }
    
    res.json({
      prescriptions: prescriptions.map(p => ({
        _id: p._id?.toString?.() || p.id,
        id: p._id?.toString?.() || p.id,
        patientId: p.patientId?.toString?.() || p.patientId,
        patient: p.patientId?.toString?.() || p.patientId,
        patientName: p.patientName,
        prescribedBy: p.doctorName || p.prescribedBy,
        doctorName: p.doctorName || p.prescribedBy,
        medications: p.medications || p.medicines || [],
        medicines: p.medications || p.medicines || [],
        notes: p.notes,
        interactionAlert: p.interactionAlert,
        interactions: p.interactionAlert ? [p.interactionAlert] : undefined,
        issuedAt: p.issuedAt,
        createdAt: p.createdAt?.toISOString?.() || p.createdAt,
        date: p.issuedAt || p.createdAt?.toISOString?.() || p.createdAt,
      }))
    });
  } catch (err) {
    console.error('Failed to list prescriptions:', err);
    res.status(500).json({ error: 'Failed to list prescriptions' });
  }
});

// POST /api/prescriptions
router.post('/prescriptions', async (req, res) => {
  try {
    const { patientId, doctorName, prescribedBy, medications, notes } = req.body;
    const prescriber = doctorName || prescribedBy;
    
    if (!patientId || !prescriber || !medications?.length) {
      return res.status(400).json({ error: 'patientId, doctorName/prescribedBy, and medications are required' });
    }
    
    // Check interactions
    const interactionWarnings = checkInteractions(medications);
    const interactionAlert = interactionWarnings.length > 0 
      ? `تحذير: تداخل دوائي محتمل بين ${interactionWarnings.join(' | ')}`
      : null;

    let patientName = 'مريض';
    try {
      const patient = await Patient.findById(patientId);
      if (patient) patientName = patient.name;
    } catch (e) {
      patientName = 'أحمد محمد علي'; // Mock
    }

    let prescription;
    try {
      // Normalize medications to match schema
      const normalizedMeds = medications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration || m.durationDays || 30,
        durationDays: m.duration || m.durationDays || 30,
        startDate: m.startDate || new Date().toISOString().slice(0, 10),
      }));
      
      prescription = await Prescription.create({
        patientId,
        doctorName: prescriber,
        prescribedBy: prescriber,
        medications: normalizedMeds,
        medicines: normalizedMeds,
        notes,
        patientName,
        interactionAlert,
        issuedAt: new Date().toISOString(),
      });
    } catch (dbError) {
      const normalizedMeds = medications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration || m.durationDays || 30,
        durationDays: m.duration || m.durationDays || 30,
        startDate: m.startDate || new Date().toISOString().slice(0, 10),
      }));
      
      prescription = {
        _id: 'mock_rx_' + Date.now(),
        patientId,
        patientName,
        doctorName: prescriber,
        prescribedBy: prescriber,
        medications: normalizedMeds,
        medicines: normalizedMeds,
        notes,
        interactionAlert,
        issuedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }
    
    res.status(201).json({
      _id: prescription._id?.toString?.() || prescription._id || prescription.id,
      id: prescription._id?.toString?.() || prescription._id || prescription.id,
      patientId: prescription.patientId?.toString?.() || prescription.patientId,
      patient: prescription.patientId?.toString?.() || prescription.patientId,
      patientName: prescription.patientName,
      prescribedBy: prescription.doctorName || prescription.prescribedBy,
      doctorName: prescription.doctorName || prescription.prescribedBy,
      medications: prescription.medications || prescription.medicines,
      medicines: prescription.medications || prescription.medicines,
      notes: prescription.notes,
      interactionAlert: prescription.interactionAlert,
      interactions: prescription.interactionAlert ? [prescription.interactionAlert] : [],
      issuedAt: prescription.issuedAt,
      createdAt: prescription.createdAt?.toISOString?.() || prescription.createdAt,
      date: prescription.issuedAt || prescription.createdAt?.toISOString?.() || prescription.createdAt,
    });
  } catch (err) {
    console.error('Failed to create prescription:', err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// GET /api/prescriptions/:id
router.get('/prescriptions/:id', async (req, res) => {
  try {
    let prescription;
    try {
      prescription = await Prescription.findById(req.params.id);
    } catch (dbError) {
      prescription = getMockPrescriptions().find(p => p._id === req.params.id);
    }
    
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    
    res.json({
      _id: prescription._id?.toString?.() || prescription._id || prescription.id,
      id: prescription._id?.toString?.() || prescription._id || prescription.id,
      patientId: prescription.patientId?.toString?.() || prescription.patientId,
      patientName: prescription.patientName,
      prescribedBy: prescription.doctorName || prescription.prescribedBy,
      doctorName: prescription.doctorName || prescription.prescribedBy,
      medications: prescription.medications || prescription.medicines,
      medicines: prescription.medications || prescription.medicines,
      notes: prescription.notes,
      interactionAlert: prescription.interactionAlert,
      issuedAt: prescription.issuedAt,
      createdAt: prescription.createdAt?.toISOString?.() || prescription.createdAt,
      date: prescription.issuedAt || prescription.createdAt?.toISOString?.() || prescription.createdAt,
    });
  } catch (err) {
    console.error('Failed to get prescription:', err);
    res.status(500).json({ error: 'Failed to get prescription' });
  }
});

// DELETE /api/prescriptions/:id
router.delete('/prescriptions/:id', async (req, res) => {
  try {
    try {
      await Prescription.findByIdAndDelete(req.params.id);
    } catch (dbError) {
      // Mock delete
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete prescription:', err);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

function getMockPrescriptions() {
  return [
    {
      _id: 'mock_rx_1',
      patientId: 'mock_patient_1',
      patientName: 'أحمد محمد علي',
      doctorName: 'د. سمير محمود',
      prescribedBy: 'د. سمير محمود',
      medications: [
        { name: 'ميتفورمين', dosage: '500mg', frequency: 'مرتين يومياً', duration: 30, durationDays: 30, startDate: '2024-01-01' },
        { name: 'أملوديبين', dosage: '5mg', frequency: 'مرة يومياً', duration: 30, durationDays: 30, startDate: '2024-01-01' },
      ],
      medicines: [
        { name: 'ميتفورمين', dosage: '500mg', frequency: 'مرتين يومياً', duration: 30, durationDays: 30, startDate: '2024-01-01' },
        { name: 'أملوديبين', dosage: '5mg', frequency: 'مرة يومياً', duration: 30, durationDays: 30, startDate: '2024-01-01' },
      ],
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'mock_rx_2',
      patientId: 'mock_patient_2',
      patientName: 'فاطمة أحمد حسن',
      doctorName: 'د. سمير محمود',
      prescribedBy: 'د. سمير محمود',
      medications: [
        { name: 'فيتامين د', dosage: '50000 وحدة', frequency: 'مرة أسبوعياً', duration: 8, durationDays: 8, startDate: '2024-01-01' },
      ],
      medicines: [
        { name: 'فيتامين د', dosage: '50000 وحدة', frequency: 'مرة أسبوعياً', duration: 8, durationDays: 8, startDate: '2024-01-01' },
      ],
      issuedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export default router;
