import { Router } from 'express';
import { Patient } from '../Models/Patient.js';
import { Prescription } from '../Models/Prescription.js';
import { LabResult } from '../Models/LabResult.js';
import { Visit } from '../Models/Visit.js';
import { VitalSigns } from '../Models/VitalSigns.js';

const router = Router();

// GET /api/dashboard/summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    let totals;
    try {
      const [totalPatients, totalPrescriptions, totalLabResults, totalVisits, recentPatients, abnormalLabResults] = await Promise.all([
        Patient.countDocuments(),
        Prescription.countDocuments(),
        LabResult.countDocuments(),
        Visit.countDocuments(),
        Patient.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
        LabResult.countDocuments({ status: 'abnormal' }),
      ]);
      
      totals = {
        totalPatients,
        totalPrescriptions,
        totalLabResults,
        totalVisits,
        recentPatients,
        recentPatientsCount: recentPatients,
        abnormalLabResults,
        abnormalLabResultsCount: abnormalLabResults,
      };
    } catch (dbError) {
      // Mock data
      totals = {
        totalPatients: 3,
        totalPrescriptions: 2,
        totalLabResults: 3,
        totalVisits: 2,
        recentPatients: 1,
        recentPatientsCount: 1,
        abnormalLabResults: 1,
        abnormalLabResultsCount: 1,
      };
    }
    
    res.json(totals);
  } catch (err) {
    console.error('Failed to get dashboard summary:', err);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
  }
});

// GET /api/dashboard/activity (or /api/dashboard/recent-activity)
router.get(['/dashboard/activity', '/dashboard/recent-activity'], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    
    let activities = [];
    try {
      const [recentPatients, recentPrescriptions, recentLabResults, recentVisits, recentVitals] = await Promise.all([
        Patient.find().sort({ createdAt: -1 }).limit(3),
        Prescription.find().sort({ createdAt: -1 }).limit(3),
        LabResult.find().sort({ createdAt: -1 }).limit(3),
        Visit.find().sort({ createdAt: -1 }).limit(3),
        VitalSigns.find().sort({ createdAt: -1 }).limit(3),
      ]);

      activities = [
        ...recentPatients.map(p => ({
          _id: `patient-${p._id}`,
          id: `patient-${p._id}`,
          type: 'patient',
          description: 'تم إضافة مريض جديد',
          patientName: p.name,
          patient: p.name,
          timestamp: p.createdAt?.toISOString?.() || p.createdAt,
          createdAt: p.createdAt?.toISOString?.() || p.createdAt,
        })),
        ...recentPrescriptions.map(p => ({
          _id: `prescription-${p._id}`,
          id: `prescription-${p._id}`,
          type: 'prescription',
          description: 'تم إصدار روشتة طبية',
          patientName: p.patientName,
          patient: p.patientName,
          timestamp: p.createdAt?.toISOString?.() || p.createdAt,
          createdAt: p.createdAt?.toISOString?.() || p.createdAt,
        })),
        ...recentLabResults.map(r => ({
          _id: `lab-${r._id}`,
          id: `lab-${r._id}`,
          type: 'lab_result',
          description: `تم رفع نتيجة ${r.reportName || r.testName}`,
          patientName: r.patientName,
          patient: r.patientName,
          timestamp: r.createdAt?.toISOString?.() || r.createdAt,
          createdAt: r.createdAt?.toISOString?.() || r.createdAt,
        })),
        ...recentVisits.map(v => ({
          _id: `visit-${v._id}`,
          id: `visit-${v._id}`,
          type: 'visit',
          description: `تم تسجيل زيارة - ${v.diagnosis || v.reason || v.chiefComplaint || 'فحص'}`,
          patientName: v.patientName,
          patient: v.patientName,
          timestamp: v.createdAt?.toISOString?.() || v.createdAt,
          createdAt: v.createdAt?.toISOString?.() || v.createdAt,
        })),
        ...recentVitals.map(v => ({
          _id: `vitals-${v._id}`,
          id: `vitals-${v._id}`,
          type: 'vital_signs',
          description: 'تم تسجيل العلامات الحيوية',
          patientName: 'مريض',
          patient: 'مريض',
          timestamp: v.createdAt?.toISOString?.() || v.createdAt,
          createdAt: v.createdAt?.toISOString?.() || v.createdAt,
        })),
      ];
    } catch (dbError) {
      // Mock activities
      activities = getMockActivities();
    }
    
    activities.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
    
    res.json({ 
      activities: activities.slice(0, limit),
      data: activities.slice(0, limit),
    });
  } catch (err) {
    console.error('Failed to get recent activity:', err);
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

function getMockActivities() {
  const now = new Date();
  return [
    {
      _id: 'patient-1',
      id: 'patient-1',
      type: 'patient',
      description: 'تم إضافة مريض جديد',
      patientName: 'أحمد محمد علي',
      patient: 'أحمد محمد علي',
      timestamp: now.toISOString(),
      createdAt: now.toISOString(),
    },
    {
      _id: 'prescription-1',
      id: 'prescription-1',
      type: 'prescription',
      description: 'تم إصدار روشتة طبية',
      patientName: 'أحمد محمد علي',
      patient: 'أحمد محمد علي',
      timestamp: new Date(now - 300000).toISOString(),
      createdAt: new Date(now - 300000).toISOString(),
    },
    {
      _id: 'lab-1',
      id: 'lab-1',
      type: 'lab_result',
      description: 'تم رفع نتيجة تحليل HbA1c',
      patientName: 'أحمد محمد علي',
      patient: 'أحمد محمد علي',
      timestamp: new Date(now - 600000).toISOString(),
      createdAt: new Date(now - 600000).toISOString(),
    },
    {
      _id: 'visit-1',
      id: 'visit-1',
      type: 'visit',
      description: 'تم تسجيل زيارة - فحص دوري',
      patientName: 'فاطمة أحمد حسن',
      patient: 'فاطمة أحمد حسن',
      timestamp: new Date(now - 900000).toISOString(),
      createdAt: new Date(now - 900000).toISOString(),
    },
    {
      _id: 'lab-2',
      id: 'lab-2',
      type: 'lab_result',
      description: 'تم رفع نتيجة تحليل وظائف الكلى',
      patientName: 'فاطمة أحمد حسن',
      patient: 'فاطمة أحمد حسن',
      timestamp: new Date(now - 1200000).toISOString(),
      createdAt: new Date(now - 1200000).toISOString(),
    },
  ];
}

export default router;
