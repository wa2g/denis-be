// import { useRouter } from 'next/navigation';

export const getAuthToken = () => {
  const userCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  return userCookie ? userCookie.split('=')[1] : null;
};

export const getUserRole = () => {
  const userCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('user='));
  if (!userCookie) return null;
  try {
    const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
    return userData.role;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};

export const LogOut = (redirect: boolean = true) => {
  // Clear cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  
  // Clear localStorage
  localStorage.clear();
  
  // Redirect to login if redirect is true
  if (redirect) {
    window.location.href = '/login';
  }
};

export const toTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const handleUnauthorizedResponse = (response: Response): boolean => {
  if (response.status === 401) {
    // Redirect to login page
    window.location.href = '/login';
    return true;
  }
  return false;
};