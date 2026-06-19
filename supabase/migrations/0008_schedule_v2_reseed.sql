insert into public.program_schedule (id, academic_year, config, updated_at)
values (
  'current',
  '2025-2026',
  $json$
{
  "version": 2,
  "weekly": [
    { "id": "w1", "activity": "Continuity Clinic", "days": ["Mon","Tue","Thu"], "start": "08:30", "end": "12:00", "kind": "clinic", "note": "" },
    { "id": "w2", "activity": "Didactics", "days": ["Wed","Fri"], "start": "10:00", "end": "12:00", "kind": "didactic", "note": "Wed & Fri sessions rotate weekly — see the monthly calendar below" },
    { "id": "w3", "activity": "CGM & Insulin Pump Review", "days": ["Thu"], "start": "13:00", "end": "14:00", "kind": "training", "note": "" },
    { "id": "w4", "activity": "Thyroid US & FNA Training", "days": ["Fri"], "start": "13:00", "end": "15:00", "kind": "training", "note": "" },
    { "id": "w5", "activity": "Friday Fellows' Lecture (Dr. Zenebe)", "days": ["Fri"], "start": "13:00", "end": "15:00", "kind": "lecture", "note": "" }
  ],
  "rotations": ["Research","Consult 1","Consult 2","Consult 3","Consult 4","Consult 5","Consult 6","RIA","Elective","Radiology","Radiology/Peds","Peds","Vacation"],
  "fellows": [
    { "id": "beg", "name": "Dr. Beg", "pgy": "PGY-4" },
    { "id": "khan", "name": "Dr. Khan", "pgy": "PGY-4" },
    { "id": "clarke", "name": "Dr. Clarke", "pgy": "PGY-5" }
  ],
  "blocks": [
    { "id": "b07", "label": "July", "start": "2025-07-01", "end": "2025-07-31", "attending": "Dr. Odonkor", "assignments": { "beg": "Research", "khan": "Consult 1", "clarke": "Consult 1" } },
    { "id": "b08", "label": "August", "start": "2025-08-01", "end": "2025-08-31", "attending": "Dr. Ganta", "assignments": { "beg": "Consult 1", "khan": "Research", "clarke": "Radiology" } },
    { "id": "b09", "label": "September", "start": "2025-09-01", "end": "2025-09-30", "attending": "Dr. Takalloo", "assignments": { "beg": "RIA", "khan": "Consult 2", "clarke": "Research/Vacation (1-14)" } },
    { "id": "b10", "label": "October", "start": "2025-10-01", "end": "2025-10-31", "attending": "Dr. Odonkor", "assignments": { "beg": "Consult 2", "khan": "Elective", "clarke": "Consult 2" } },
    { "id": "b11", "label": "November", "start": "2025-11-01", "end": "2025-11-30", "attending": "Dr. Zenebe", "assignments": { "beg": "Elective", "khan": "Consult 3", "clarke": "Elective" } },
    { "id": "b12", "label": "December", "start": "2025-12-01", "end": "2025-12-31", "attending": "Dr. Takalloo", "assignments": { "beg": "Consult 3", "khan": "Research/Vacation (22-28)", "clarke": "Research" } },
    { "id": "b01", "label": "January", "start": "2026-01-01", "end": "2026-01-31", "attending": "Dr. Nunlee-Bland", "assignments": { "beg": "Vacation (19-30)", "khan": "Consult 4", "clarke": "Consult 3" } },
    { "id": "b02", "label": "February", "start": "2026-02-01", "end": "2026-02-28", "attending": "Dr. Zenebe", "assignments": { "beg": "Consult 4", "khan": "Radiology", "clarke": "Elective/Vacation (23-28)" } },
    { "id": "b03", "label": "March", "start": "2026-03-01", "end": "2026-03-31", "attending": "Dr. Ganta", "assignments": { "beg": "Radiology", "khan": "Consult 5", "clarke": "Research" } },
    { "id": "b04", "label": "April", "start": "2026-04-01", "end": "2026-04-30", "attending": "Dr. Zenebe", "assignments": { "beg": "Consult 5", "khan": "RIA", "clarke": "Research" } },
    { "id": "b05", "label": "May", "start": "2026-05-01", "end": "2026-05-31", "attending": "Dr. Ganta", "assignments": { "beg": "Research/Vacation (25-31)", "khan": "Consult 6", "clarke": "Radiology/Peds" } },
    { "id": "b06", "label": "June", "start": "2026-06-01", "end": "2026-06-30", "attending": "Dr. Takalloo", "assignments": { "beg": "Consult 6", "khan": "Vacation (16-29)", "clarke": "Consult 4" } }
  ],
  "months": [
    {
      "id": "m-2026-06",
      "ym": "2026-06",
      "label": "June 2026",
      "subtitle": "Images, Genetics and Transplant Medicine",
      "sessions": [
        { "id": "s1", "date": "2026-06-02", "title": "Grand Rounds" },
        { "id": "s2", "date": "2026-06-03", "title": "CCC Meeting" },
        { "id": "s3", "date": "2026-06-04", "title": "Pump Clinic" },
        { "id": "s4", "date": "2026-06-05", "title": "Mid-year Evaluations & Grad Lunch" },
        { "id": "s5", "date": "2026-06-09", "title": "Grand Rounds" },
        { "id": "s6", "date": "2026-06-10", "title": "Transplant Medicine" },
        { "id": "s7", "date": "2026-06-11", "title": "Graduation", "badge": "🎓" },
        { "id": "s8", "date": "2026-06-12", "title": "Journal Club" },
        { "id": "s9", "date": "2026-06-17", "title": "Endocrine Genetics" },
        { "id": "s10", "date": "2026-06-19", "title": "Juneteenth Holiday" },
        { "id": "s11", "date": "2026-06-24", "title": "DOH Review" },
        { "id": "s12", "date": "2026-06-26", "title": "Farewell Party", "badge": "🎉" }
      ],
      "coverage": {
        "consultAttending": "Dr. Takalloo",
        "consultFellows": "Dr. Clarke & Dr. Beg",
        "weekend": [
          { "id": "wk1", "who": "Dr. Clarke", "dates": "June 19-21" },
          { "id": "wk2", "who": "Dr. Beg", "dates": "June 13-14, 27-28" },
          { "id": "wk3", "who": "Dr. Khan", "dates": "June 6-7" }
        ],
        "procedureFellow": "Dr. Khan / Dr. Clarke"
      }
    }
  ]
}
  $json$::jsonb,
  now()
)
on conflict (id) do update
  set academic_year = excluded.academic_year,
      config = excluded.config,
      updated_at = now();
