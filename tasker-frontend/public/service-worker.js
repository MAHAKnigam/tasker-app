self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = { title: 'Tasker reminder', body: event.data ? event.data.text() : 'A task is due soon.' };
  }

  const title = data.title || 'Tasker reminder';
  const options = {
    body: data.body || 'You have a task due soon.',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'tasker-reminder',
    data: { url: data.url || '/calendar' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/calendar', self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        if ('navigate' in existing) existing.navigate(target);
        return existing.focus();
      }
      return clients.openWindow(target);
    })
  );
});
