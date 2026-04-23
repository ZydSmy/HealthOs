import { Schema, model } from 'mongoose';

const vitalSignsSchema = new Schema(
  {
    patientId:              { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    bloodPressureSystolic:  { type: Number },
    bloodPressureDiastolic: { type: Number },
    heartRate:              { type: Number },
    bloodSugar:             { type: Number },
    temperature:            { type: Number },
    oxygenSaturation:       { type: Number },
    weight:                 { type: Number },
    recordedAt:             { type: String, required: true },
  },
  { timestamps: true },
);

export const VitalSigns = model('VitalSigns', vitalSignsSchema);
