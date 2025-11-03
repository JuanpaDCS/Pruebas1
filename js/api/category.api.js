// js/api/category.api.js
import AuthService from '../services/auth.service.js';
const API_URL = ' http://localhost:10000/api/v1';
/**
 * [Admin] Obtiene todas las categorías.
 */
export const getCategories = async () => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar categorías');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Obtiene una categoría por su ID.
 */
export const getCategoryById = async (categoryId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/categories/${categoryId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar la categoría');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Crea una nueva categoría.
 */
export const createCategory = async (categoryData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear la categoría');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Actualiza una categoría por su ID.
 */
export const updateCategory = async (categoryId, categoryData) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar la categoría');
  }
  return response.json();
};

/**
 * ¡NUEVO!
 * [Admin] Elimina una categoría por su ID.
 */
export const deleteCategory = async (categoryId) => {
  const token = AuthService.getToken();
  if (!token) throw new Error('No autorizado');

  const response = await fetch(`${API_URL}/categories/${categoryId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar la categoría');
  }
  return response.json();
};