// Изпълнява cb в свободно време (или най-късно след `timeout` ms). Връща функция за отмяна.
export function whenIdle(cb, timeout = 4000) {
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, Math.min(timeout, 2500)));
  const cancel = window.cancelIdleCallback || clearTimeout;
  const id = idle(cb, { timeout });
  return () => cancel(id);
}
