import { getAdminServices } from '@/lib/firebase/server';
import { nanoid } from 'nanoid';

const OCCUPATIONS = [
  'Physiotherapist',
  'Occupational Therapist',
  'Pharmacist',
  'Speech Therapist',
  'Audiologist',
  'Dietitian',
  'Radiographer',
  'Clinical Psychologist',
  'Social Worker',
];

const SPECIALTIES = [
  'Musculoskeletal',
  'Neurology',
  'Paediatrics',
  'Cardio-respiratory',
  'Sports',
  'Geriatrics',
  'Mental Health',
  'Community Rehab',
];

const LANGUAGES = ['English', 'Afrikaans', 'isiXhosa', 'isiZulu', 'Sesotho', 'Setswana'];
const PROVINCES = ['EC', 'FS', 'GP', 'KZN', 'LP', 'MP', 'NW', 'NC', 'WC'];

async function main() {
  const { db } = getAdminServices();
  const batch = db.batch();
  for (let i = 0; i < 30; i++) {
    const id = nanoid();
    const occupation = OCCUPATIONS[i % OCCUPATIONS.length];
    const province = PROVINCES[i % PROVINCES.length];
    const specialties = SPECIALTIES.slice(0, (i % SPECIALTIES.length) + 1);
    const languages = LANGUAGES.slice(0, 2 + (i % 3));
    const fullName = `Demo Professional ${i + 1}`;
    const profile = {
      id,
      fullName,
      email: `demo${i + 1}@example.com`,
      role: i % 2 === 0 ? 'Mentor' : 'Mentee',
      occupation,
      province,
      city: 'Demo City',
      specialties,
      languages,
      bioShort: 'Committed to mentorship and community impact.',
      discoverable: true,
      createdAt: new Date().toISOString(),
    };
    batch.set(db.collection('users').doc(id), profile);
    batch.set(db.collection('profiles_public').doc(id), profile);
  }
  await batch.commit();
  console.log('Seeded demo profiles.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
