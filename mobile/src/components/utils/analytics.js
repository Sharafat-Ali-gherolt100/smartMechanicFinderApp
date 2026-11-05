class Analytics {
  static instance = null;

  static getInstance() {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  constructor() {
    this.isEnabled = true;
    this.events = [];
  }

  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      platform: 'mobile',
    };

    this.events.push(event);
    console.log('[Analytics]', event);

    // Send to server
    this.sendToServer(event);
  }

  async sendToServer(event) {
    try {
      // Send to backend analytics endpoint
      // await api.post('/analytics', event);
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  trackScreen(screenName) {
    this.track('screen_view', { screen_name: screenName });
  }

  trackError(error, context = '') {
    this.track('error', {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  trackUserAction(action, data = {}) {
    this.track('user_action', { action, ...data });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export const analytics = Analytics.getInstance();