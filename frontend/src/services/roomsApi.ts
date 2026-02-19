import { api } from './apiClient';

export interface RoomAvailability {
  room: string;
  status: 'free' | 'occupied' | 'unknown';
  currentEvent?: string;
  freeSlots: { start: string; end: string }[];
  occupiedSlots: { start: string; end: string; summary: string }[];
  nextFree?: { start: string; end: string };
}

export function fetchRoomAvailability(): Promise<RoomAvailability[]> {
  return api.get<RoomAvailability[]>('/api/rooms/availability');
}
