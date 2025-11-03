// js/api/dishReview.api.js

import AuthService from '../services/auth.service.js';
const API_URL = 'https://gestor-restaurante-proyecto-fullstack-1p49.onrender.com/api/v1';

/**
 * [Usuario] Obtiene las reseñas de un platillo específico.
 */
export const getReviewsByDish = async (dishId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dishes/${dishId}/reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar reseñas del platillo');
  }
  return response.json();
};

/**
 * [Usuario] Crea una nueva reseña para un platillo.
 */
export const createDishReview = async (dishId, reviewData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dishes/${dishId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear la reseña');
  }
  return response.json();
};

/**
 * [Usuario] Actualiza su propia reseña de platillo.
 */
export const updateDishReview = async (reviewId, reviewData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dish-reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar la reseña');
  }
  return response.json();
};

/**
 * [Usuario o Admin] Elimina una reseña de platillo.
 */
export const deleteDishReview = async (reviewId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dish-reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar la reseña');
  }
  return response.json();
};