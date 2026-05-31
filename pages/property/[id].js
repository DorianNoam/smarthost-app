import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PropertyRedirect() {
  const router = useRouter();
  useEffect(() => { router.push('/dashboard'); }, []);
  return null;
}
