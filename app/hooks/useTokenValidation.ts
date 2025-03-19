import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired, LogOut } from '@/app/utils';

export const useTokenValidation = () => {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token || isTokenExpired(token)) {
      LogOut(true);
    }
  }, [router]);
}; 