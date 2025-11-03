// js/api/restaurant.api.js

import AuthService from '../services/auth.service.js';
const API_URL = ' http://localhost:10000/api/v1';

/**
 * [Admin] Crea un nuevo restaurante.
 * (Esta función ya la tienes)
 */
export const createRestaurant = async (restaurantData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(restaurantData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el restaurante');
  }
  return response.json();
};

/**
 * [Usuario/Admin] Obtiene la lista de restaurantes.
 * (Esta función ya la tienes)
 */
export const getRestaurants = async () => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar los restaurantes');
  }
  return response.json();
};

/**
 * [Admin] Elimina un restaurante por su ID.
 * (Esta función ya la tienes)
 */
export const deleteRestaurant = async (restaurantId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el restaurante');
  }
  return response.json();
};


/**
 * ¡NUEVO!
 * [Usuario/Admin] Obtiene un SOLO restaurante por su ID.
 */
export const getRestaurantById = async (restaurantId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener datos del restaurante');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Actualiza un restaurante por su ID.
 */
export const updateRestaurant = async (restaurantId, restaurantData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(restaurantData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el restaurante');
  }
  return response.json();
};