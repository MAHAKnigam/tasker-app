const FREQUENCIES = ['daily', 'weekly', 'monthly'];

function validateRecurrence(recurrence) {
  if (!recurrence || typeof recurrence !== 'object') {
    return 'Recurrence settings are required';
  }
  if (!FREQUENCIES.includes(recurrence.frequency)) {
    return 'Frequency must be daily, weekly, or monthly';
  }
  const interval = recurrence.interval === undefined ? 1 : Number(recurrence.interval);
  if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
    return 'Recurrence interval must be a whole number between 1 and 365';
  }
  if (recurrence.endDate && Number.isNaN(new Date(recurrence.endDate).getTime())) {
    return 'Recurrence end date is invalid';
  }
  return null;
}

function getNextDueDate(currentDueDate, recurrence) {
  const validationError = validateRecurrence(recurrence);
  if (validationError) throw new Error(validationError);
  if (!currentDueDate || Number.isNaN(new Date(currentDueDate).getTime())) {
    throw new Error('A valid due date is required for recurring tasks');
  }

  const next = new Date(currentDueDate);
  const interval = recurrence.interval === undefined ? 1 : Number(recurrence.interval);

  if (recurrence.frequency === 'daily') {
    next.setUTCDate(next.getUTCDate() + interval);
  } else if (recurrence.frequency === 'weekly') {
    next.setUTCDate(next.getUTCDate() + interval * 7);
  } else {
    const day = next.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + interval);
    const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
    next.setUTCDate(Math.min(day, lastDay));
  }

  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (next > endDate) return null;
  }
  return next;
}

module.exports = { FREQUENCIES, validateRecurrence, getNextDueDate };
