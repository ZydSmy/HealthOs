import { Schema, model } from 'mongoose';

const medicationSchema = new Schema(
  {
    name:         { type: String, required: true },
    dosage:       { type: String, required: true },
    frequency:    { type: String, required: true },
    duration:     { type: Number, required: true },
    durationDays: { type: Number },
    startDate:    { type: String },
  },
  { _id: false },
);

const prescriptionSchema = new Schema(
  {
    patientId:        { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName:      { type: String, required: true },
    doctorName:       { type: String, required: true },
    medications:      { type: [medicationSchema], required: true },
    notes:            { type: String },
    interactionAlert: { type: String },
    issuedAt:         { type: String, required: true },
  },
  { timestamps: true },
);

export const Prescription = model('Prescription', prescriptionSchema);
