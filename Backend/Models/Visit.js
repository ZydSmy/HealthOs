import { Schema, model } from 'mongoose';

const visitSchema = new Schema(
  {
    patientId:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    doctorName:  { type: String, required: true },
    diagnosis:   { type: String, required: true },
    notes:       { type: String },
    visitDate:   { type: String, required: true },
  },
  { timestamps: true },
);

export const Visit = model('Visit', visitSchema);
