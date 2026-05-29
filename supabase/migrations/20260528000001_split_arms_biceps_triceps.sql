-- Split legacy "arms" muscle group into biceps + triceps in exercise_library

UPDATE exercise_library
SET muscle_group = 'biceps'
WHERE muscle_group = 'arms'
  AND (
    name ILIKE '%bicep%'
    OR name ILIKE '%curl%'
    OR name ILIKE '%hammer%'
    OR name ILIKE '%preacher%'
    OR name ILIKE '%21%'
  );

UPDATE exercise_library
SET muscle_group = 'triceps'
WHERE muscle_group = 'arms';
