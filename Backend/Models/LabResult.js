import { Schema, model } from 'mongoose';

const labResultSchema = new Schema(
  {
    patientId:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    reportName:  { type: String, required: true },
    reportType:  { type: String, enum: ['blood','urine','radiology','mri','xray','ultrasound','other'], required: true },
    status:      { type: String, enum: ['normal','abnormal','pending'], required: true },
    fileUrl:     { type: String },
    notes:       { type: String },
    date:        { type: String, required: true },
  },
  { timestamps: true },
);

export const LabResult = model('LabResult', labResultSchema);
