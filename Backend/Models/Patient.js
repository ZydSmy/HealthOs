import { Schema, model } from 'mongoose';

const patientSchema = new Schema(
  {
    name:            { type: String, required: true },
    nationalId:      { type: String, sparse: true },
    dateOfBirth:     { type: String },
    gender:          { type: String, enum: ['male', 'female'], default: 'male' },
    bloodType:       { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], default: 'O+' },
    phone:           { type: String },
    address:         { type: String },
    allergies:       { type: [String], default: [] },
    chronicDiseases: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Patient = model('Patient', patientSchema);
