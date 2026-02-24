import { getDb } from './mongo.js';

/**
 * Check whether a proposed time range overlaps an existing timeblock
 * for the same user on the same day.
 *
 * Overlap condition (lexicographic HH:MM comparison is correct):
 *   existing.startTime < newEnd  AND  existing.endTime > newStart
 */
export async function checkOverlap(
  userId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
): Promise<{ date: string; startTime: string; endTime: string } | null> {
  const filter: Record<string, unknown> = {
    userId,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeId) {
    filter['_id'] = { $ne: excludeId };
  }

  const conflict = await getDb().collection('timeblocks').findOne(filter);
  if (!conflict) return null;

  return {
    date: conflict.date as string,
    startTime: conflict.startTime as string,
    endTime: conflict.endTime as string,
  };
}

/**
 * Check whether a proposed location/time overlaps any existing timeblock
 * at the same location, regardless of who booked it.
 * Only applies to exclusive locations (currently 'B2-1').
 * 'BU' allows concurrent bookings by multiple users.
 */
export async function checkLocationOverlap(
  location: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
): Promise<{ date: string; startTime: string; endTime: string } | null> {
  // BU is a shared space — multiple monitors can book it simultaneously
  if (location !== 'B2-1') return null;

  const filter: Record<string, unknown> = {
    location,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeId) {
    filter['_id'] = { $ne: excludeId };
  }

  const conflict = await getDb().collection('timeblocks').findOne(filter);
  if (!conflict) return null;

  return {
    date: conflict.date as string,
    startTime: conflict.startTime as string,
    endTime: conflict.endTime as string,
  };
}
