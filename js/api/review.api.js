// js/api/review.api.js

import AuthService from '../services/auth.service.js';
const API_URL = ' https://gestor-restaurante-proyecto-fullstack-1p49.onrender.com/api/v1';

/**
 * [Usuario] Obtiene las reseñas de un restaurante específico.
 */
export const getReviewsByRestaurant = async (restaurantId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}/reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar reseñas');
  }
  return response.json();
};

/**
 * [Usuario] Crea una nueva reseña para un restaurante.
 */
export const createRestaurantReview = async (restaurantId, reviewData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}/reviews`, {
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
 * [Usuario] Actualiza su propia reseña de restaurante.
 */
export const updateRestaurantReview = async (reviewId, reviewData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
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
 * [Usuario o Admin] Elimina una reseña de restaurante.
 */
export const deleteRestaurantReview = async (reviewId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
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