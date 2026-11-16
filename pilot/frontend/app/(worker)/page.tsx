import Link from 'next/link';
import { clearWorkflow } from '@/lib/workflow';
import HomeClient from '@/components/worker/HomeClient';

export default function HomePage() {
  return <HomeClient />;
}