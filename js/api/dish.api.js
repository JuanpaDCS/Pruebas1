// js/api/dish.api.js

import AuthService from '../services/auth.service.js';
const API_URL = ' https://gestor-restaurante-proyecto-fullstack-1p49.onrender.com/api/v1';
/**
 * [Usuario/Admin] Obtiene los platillos de un restaurante específico.
 */
export const getDishesByRestaurant = async (restaurantId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}/dishes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar los platillos');
  }
  return response.json();
};

/**
 * [Admin] Crea un nuevo platillo para un restaurante.
 */
export const createDish = async (restaurantId, dishData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/restaurants/${restaurantId}/dishes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(dishData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el platillo');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Obtiene un SOLO platillo por su ID.
 */
export const getDishById = async (dishId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dishes/${dishId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener datos del platillo');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Actualiza un platillo por su ID.
 */
export const updateDish = async (dishId, dishData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dishes/${dishId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(dishData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el platillo');
  }
  return response.json();
};


/**
 * ¡NUEVO!
 * [Admin] Elimina un platillo por su ID.
 */
export const deleteDish = async (dishId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/dishes/${dishId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el platillo');
  }
  return response.json();
};