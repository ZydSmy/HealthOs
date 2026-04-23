import { Router } from 'express';
import { Patient } from '../Models/Patient.js';

const router = Router();

// GET /api/patients
router.get('/patients', async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { nationalId: { $regex: search, $options: 'i' } }] }
      : {};
    
    let patients;
    try {
      patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    } catch (dbError) {
      // Mock data if DB not available
      patients = getMockPatients();
    }
    
    res.json(patients.map(p => ({
      _id: p._id?.toString() || p.id,
      id: p._id?.toString() || p.id,
      name: p.name,
      nationalId: p.nationalId,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      bloodType: p.bloodType,
      phone: p.phone,
      address: p.address,
      allergies: p.allergies || [],
      chronicDiseases: p.chronicDiseases || [],
      createdAt: p.createdAt?.toISOString?.() || p.createdAt,
      updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
    })));
  } catch (err) {
    console.error('Failed to list patients:', err);
    res.status(500).json({ error: 'Failed to list patients' });
  }
});

// POST /api/patients
router.post('/patients', async (req, res) => {
  try {
    const { name, nationalId, dateOfBirth, gender, bloodType, phone, address, allergies, chronicDiseases } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    let patient;
    try {
      patient = await Patient.create({ 
        name, 
        nationalId: nationalId || '', 
        dateOfBirth: dateOfBirth || '', 
        gender: gender || 'male', 
        bloodType: bloodType || 'O+', 
        phone, 
        address, 
        allergies: allergies || [], 
        chronicDiseases: chronicDiseases || [] 
      });
    } catch (dbError) {
      // Mock response if DB not available
      patient = {
        _id: 'mock_' + Date.now(),
        name, nationalId, dateOfBirth, gender, bloodType, phone, address, 
        allergies: allergies || [], 
        chronicDiseases: chronicDiseases || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    res.status(201).json({
      _id: patient._id?.toString?.() || patient._id || patient.id,
      id: patient._id?.toString?.() || patient._id || patient.id,
      name: patient.name,
      nationalId: patient.nationalId,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      phone: patient.phone,
      address: patient.address,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
      createdAt: patient.createdAt?.toISOString?.() || patient.createdAt,
      updatedAt: patient.updatedAt?.toISOString?.() || patient.updatedAt,
    });
  } catch (err) {
    console.error('Failed to create patient:', err);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// GET /api/patients/:id
router.get('/patients/:id', async (req, res) => {
  try {
    let patient;
    try {
      patient = await Patient.findById(req.params.id);
    } catch (dbError) {
      patient = getMockPatients().find(p => p._id === req.params.id);
    }
    
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    res.json({
      _id: patient._id?.toString?.() || patient._id || patient.id,
      id: patient._id?.toString?.() || patient._id || patient.id,
      name: patient.name,
      nationalId: patient.nationalId,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      phone: patient.phone,
      address: patient.address,
      allergies: patient.allergies || [],
      chronicDiseases: patient.chronicDiseases || [],
      createdAt: patient.createdAt?.toISOString?.() || patient.createdAt,
      updatedAt: patient.updatedAt?.toISOString?.() || patient.updatedAt,
    });
  } catch (err) {
    console.error('Failed to get patient:', err);
    res.status(500).json({ error: 'Failed to get patient' });
  }
});

// PUT /api/patients/:id
router.put('/patients/:id', async (req, res) => {
  try {
    const { name, nationalId, dateOfBirth, gender, bloodType, phone, address, allergies, chronicDiseases } = req.body;
    
    let patient;
    try {
      patient = await Patient.findByIdAndUpdate(
        req.params.id, 
        { name, nationalId, dateOfBirth, gender, bloodType, phone, address, allergies, chronicDiseases }, 
        { new: true }
      );
    } catch (dbError) {
      patient = { _id: req.params.id, name, nationalId, dateOfBirth, gender, bloodType, phone, address, allergies, chronicDiseases };
    }
    
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    res.json({
      _id: patient._id?.toString?.() || patient._id || patient.id,
      id: patient._id?.toString?.() || patient._id || patient.id,
      name: patient.name,
      nationalId: patient.nationalId,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      phone: patient.phone,
      address: patient.address,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
      createdAt: patient.createdAt?.toISOString?.() || patient.createdAt,
      updatedAt: patient.updatedAt?.toISOString?.() || patient.updatedAt,
    });
  } catch (err) {
    console.error('Failed to update patient:', err);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id
router.delete('/patients/:id', async (req, res) => {
  try {
    try {
      await Patient.findByIdAndDelete(req.params.id);
    } catch (dbError) {
      // Mock delete
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete patient:', err);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Mock data for demo mode
function getMockPatients() {
  return [
    {
      _id: 'mock_patient_1',
      name: 'أحمد محمد علي',
      nationalId: '29876543210987',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      bloodType: 'A+',
      phone: '01001234567',
      allergies: ['بنسلين'],
      chronicDiseases: ['سكري'],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'mock_patient_2',
      name: 'فاطمة أحمد حسن',
      nationalId: '29543210987654',
      dateOfBirth: '1995-08-22',
      gender: 'female',
      bloodType: 'O+',
      phone: '01009876543',
      allergies: [],
      chronicDiseases: ['ضغط'],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'mock_patient_3',
      name: 'محمد إبراهيم سالم',
      nationalId: '28890123456789',
      dateOfBirth: '1988-03-10',
      gender: 'male',
      bloodType: 'B+',
      phone: '011122233344',
      allergies: ['أسبرين'],
      chronicDiseases: [],
      createdAt: new Date().toISOString(),
    },
  ];
}

export default router;
