'use client';

import { ChefHat, CheckCircle2, ClipboardCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Order } from '@/types';

interface KDSStatusActionProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

interface ActionConfig {
  label: string;
  testId: string;
  className: string;
  icon: ReactNode;
  status: Order['status'];
}

function getActionConfig(order: Order): ActionConfig | null {
  switch (order.status) {
    case 'ordered':
      return {
        label: 'Start Cooking',
        status: 'cooking',
        testId: `kitchen-start-cooking-${order.id}`,
        className: 'bg-orange-500 text-white hover:bg-orange-400 focus-visible:outline-orange-300',
        icon: <ChefHat className="h-5 w-5" aria-hidden="true" />,
      };
    case 'cooking':
      return {
        label: 'Mark Ready',
        status: 'ready',
        testId: `kitchen-mark-ready-${order.id}`,
        className:
          'bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:outline-emerald-300',
        icon: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />,
      };
    case 'ready':
      return {
        label: 'Mark Served',
        status: 'served',
        testId: `kitchen-mark-served-${order.id}`,
        className: 'bg-sky-500 text-black hover:bg-sky-400 focus-visible:outline-sky-300',
        icon: <ClipboardCheck className="h-5 w-5" aria-hidden="true" />,
      };
    default:
      return null;
  }
}

export function KDSStatusAction({ order, onStatusUpdate }: KDSStatusActionProps) {
  const action = getActionConfig(order);
  if (!action) {
    return null;
  }

  return (
    <button
      type="button"
      data-testid={action.testId}
      onClick={() => onStatusUpdate(order.id, action.status)}
      className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${action.className}`}
    >
      {action.icon}
      <span>{action.label}</span>
    </button>
  );
}

KDSStatusAction.displayName = 'KDSStatusAction';
