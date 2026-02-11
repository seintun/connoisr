'use client';

import { KDSHeader } from '@/components/domain/kitchen/KDSHeader';
import { KDSInputHintBar } from '@/components/domain/kitchen/KDSInputHintBar';
import { KDSKeyboardHelp } from '@/components/domain/kitchen/KDSKeyboardHelp';
import { KDSOrderCard } from '@/components/domain/kitchen/KDSOrderCard';
import { buildKDSOrderViewModels } from '@/features/kitchen/domain/kdsSelectors';
import { useKDSInputController } from '@/hooks/useKDSInputController';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const NOW_REFRESH_MS = 1_000;
const OVERDUE_CHIME_INTERVAL_MS = 120_000;

function playKDSChime(frequency = 880, durationMs = 120) {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return;
  }

  let context: AudioContext;

  try {
    context = new window.AudioContext();
  } catch {
    return;
  }
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.02;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + durationMs / 1000);

  oscillator.onended = () => {
    void context.close();
  };
}

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useKitchenOrders();
  const [now, setNow] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const lastOverdueChimeAtRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const frame = window.requestAnimationFrame(tick);
    const interval = setInterval(tick, NOW_REFRESH_MS);

    return () => {
      window.cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  const effectiveNow = now ?? 0;
  const orderViewModels = useMemo(
    () => buildKDSOrderViewModels(orders, effectiveNow),
    [orders, effectiveNow],
  );

  const inputController = useKDSInputController({
    orders: orderViewModels,
    updateOrderStatus,
  });

  useEffect(() => {
    if (inputController.inputMode !== 'keyboard') {
      return;
    }

    const focusedId = inputController.focusedOrderId;
    if (!focusedId) {
      return;
    }

    const focusedCard = document.querySelector<HTMLElement>(
      `[data-testid="kitchen-order-card-${focusedId}"]`,
    );

    focusedCard?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [inputController.focusedOrderId, inputController.inputMode]);

  useEffect(() => {
    const currentOrderIds = new Set(orderViewModels.map((entry) => entry.order.id));
    const hasNewOrder = Array.from(currentOrderIds).some(
      (id) => !previousOrderIdsRef.current.has(id),
    );

    if (hasNewOrder && soundEnabled) {
      playKDSChime(988, 120);
    }

    previousOrderIdsRef.current = currentOrderIds;
  }, [orderViewModels, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    const hasOverdue = orderViewModels.some((entry) => entry.isOverdue);
    if (!hasOverdue) {
      return;
    }

    const nowMs = Date.now();
    if (nowMs - lastOverdueChimeAtRef.current >= OVERDUE_CHIME_INTERVAL_MS) {
      playKDSChime(660, 160);
      lastOverdueChimeAtRef.current = nowMs;
    }
  }, [orderViewModels, soundEnabled]);

  const metrics = useMemo(
    () => ({
      total: orderViewModels.length,
      overdue: orderViewModels.filter((entry) => entry.isOverdue).length,
      modified: orderViewModels.filter((entry) => entry.isModified).length,
      ordered: orderViewModels.filter((entry) => entry.order.status === 'ordered').length,
      cooking: orderViewModels.filter((entry) => entry.order.status === 'cooking').length,
      ready: orderViewModels.filter((entry) => entry.order.status === 'ready').length,
    }),
    [orderViewModels],
  );

  return (
    <div
      className="min-h-screen bg-[#0a0c0f] p-3 pb-24 sm:p-4 md:p-6 md:pb-6"
      data-testid="kitchen-page"
    >
      <KDSHeader
        metrics={metrics}
        now={now}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        inputMode={inputController.inputMode}
      />

      <main
        className="grid grid-cols-1 items-start gap-4 md:grid-cols-2"
        data-testid="kitchen-orders-grid"
      >
        {orderViewModels.map((entry) => (
          <KDSOrderCard
            key={entry.order.id}
            viewModel={entry}
            isFocused={inputController.focusedOrderId === entry.order.id}
            onFocus={inputController.setFocusedFromTouch}
            onStatusUpdate={(orderId, status) => {
              inputController.setFocusedFromTouch(orderId);
              inputController.commitStatusUpdate(orderId, status);
            }}
          />
        ))}
      </main>

      {orderViewModels.length === 0 && (
        <div
          className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-neutral-700 bg-black/20 py-20 text-neutral-400"
          data-testid="kitchen-empty-state"
        >
          <Clock className="mb-3 h-16 w-16 opacity-50" />
          <h2 className="text-2xl font-semibold text-neutral-200">No active orders</h2>
          <p>Waiting for new orders...</p>
        </div>
      )}

      <KDSInputHintBar
        inputMode={inputController.inputMode}
        actionHint={inputController.actionHint}
        undoAvailable={inputController.undoAvailable}
        onUndo={inputController.undoLastAction}
        onShowShortcuts={inputController.openShortcuts}
      />

      <KDSKeyboardHelp
        open={inputController.showShortcuts}
        onClose={inputController.closeShortcuts}
      />
    </div>
  );
}
