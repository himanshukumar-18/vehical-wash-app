import { useDispatch } from 'react-redux';

/**
 * Typed dispatch hook for The Black Wash store.
 * Use this instead of plain useDispatch throughout the app.
 */
export const useAppDispatch = () => useDispatch();
