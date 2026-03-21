/**
 * SocialShareButton — Analytics Adapters
 * @version 1.0.0
 * @license GPL-3.0
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE OVERVIEW
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Privacy by Design
 * ─────────────────
 * This library NEVER collects, stores, or transmits user data on its own.
 * It only emits interaction events locally inside the browser. All data
 * forwarding to external analytics services is performed exclusively by the
 * host website through the mechanisms described below. This keeps the library
 * compliant with GDPR, CCPA, and similar privacy regulations, and ensures that
 * the host website (not this library) is the data controller.
 *
 * Event Delivery Paths (three paths run simultaneously)
 * ──────────────────────────────────────────────────────
 *
 *  1. DOM CustomEvent  ──  document.dispatchEvent(new CustomEvent('social-share', { detail: payload }))
 *     Best for: CDN / vanilla JS, multiple independent consumers, framework-
 *     agnostic environments. Any number of listeners can subscribe with:
 *
 *       document.addEventListener('social-share', (e) => console.log(e.detail));
 *
 *  2. onAnalytics callback  ──  new SocialShareButton({ onAnalytics: (payload) => ... })
 *     Best for: single-consumer inline setups where a direct function reference
 *     is more ergonomic than a DOM listener.
 *
 *  3. Plugin / adapter registry  ──  new SocialShareButton({ analyticsPlugins: [...] })
 *     Best for: multiple analytics providers simultaneously. Each adapter
 *     implements a single track(payload) method and is held in an array.
 *     Provided built-in adapters are listed at the bottom of this file.
 *
 * Standard Event Payload Schema
 * ──────────────────────────────
 * Every event carries a consistent payload so any analytics provider can map
 * fields without custom transformation:
 *
 *   {
 *     version        : string      — schema version, e.g. '1.0'. Increment
 *                                    when the payload shape changes so
 *                                    consumers can handle migrations.
 *     source         : string      — always 'social-share-button'. Useful for
 *                                    segmentation when multiple widgets send
 *                                    events to the same analytics stream.
 *     eventName      : string      — snake_case name, e.g. 'social_share_click'
 *     interactionType: string      — 'share' | 'copy' | 'popup_open' |
 *                                    'popup_close' | 'error'
 *     platform       : string|null — sharing platform ('twitter', 'facebook', …)
 *     url            : string      — URL being shared
 *     title          : string      — page title at share time
 *     timestamp      : number      — Unix milliseconds (Date.now())
 *     componentId    : string|null — optional identifier set by the host
 *     errorMessage   : string      — only present on social_share_error events
 *   }
 *
 * Core Events
 * ────────────
 *   social_share_popup_open   — User opened the share modal/popup.
 *   social_share_popup_close  — User closed the modal (button, overlay, or Esc).
 *   social_share_click        — User clicked a platform button (intent to share).
 *   social_share_success      — Platform share window opened successfully.
 *   social_share_copy         — User copied the link to their clipboard.
 *   social_share_error        — An error prevented sharing or copying.
 *
 * Naming Convention
 * ──────────────────
 * All events follow the `social_<object>_<action>` pattern which aligns with
 * GA4's recommended event naming scheme and is compatible with Segment,
 * Mixpanel, and PostHog out of the box.
 */

// =============================================================================
// BASE ADAPTER INTERFACE
// =============================================================================

/**
 * Base class that all analytics adapters should extend.
 * Provides a no-op track() so subclasses only need to override what they use.
 *
 * Subclass contract:
 *   class MyAdapter extends SocialShareAnalyticsPlugin {
 *     track(payload) { ... }
 *   }
 */
class SocialShareAnalyticsPlugin {
  /**
   * Called by SocialShareButton for every analytics event.
   * @param {Object} payload - Standard event payload (see schema above).
   */
  // eslint-disable-next-line no-unused-vars
  track(payload) {}
}

// =============================================================================
// BUILT-IN ADAPTERS
// =============================================================================

/**
 * Google Analytics 4 (GA4) Adapter
 * 
 * Maps library events to standard window.gtag() calls.
 */
class GoogleAnalyticsAdapter extends SocialShareAnalyticsPlugin {
  /**
   * @param {Object} [config] - Optional configuration
   * @param {string} [config.eventCategory] - Custom category for events (default: 'social_share')
   */
  constructor(config = {}) {
    super();
    this.eventCategory = config.eventCategory || "social_share";
  }

  track(payload) {
    // Check if gtag script is loaded and initialized
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    // Forward event to GA4 with recommended social sharing parameters
    window.gtag("event", payload.eventName, {
      event_category: this.eventCategory,
      event_label: payload.platform,
      share_platform: payload.platform,
      share_url: payload.url,
      share_title: payload.title,
      interaction_type: payload.interactionType,
      component_id: payload.componentId,
      // Only include error message if it exists
      ...(payload.errorMessage ? { error_message: payload.errorMessage } : {}),
    });
  }
}

/**
 * Mixpanel Adapter
 * 
 * Maps library events to standard window.mixpanel.track() calls.
 */
class MixpanelAdapter extends SocialShareAnalyticsPlugin {
  track(payload) {
    // Check if mixpanel library is initialized
    if (
      typeof window === "undefined" ||
      typeof window.mixpanel === "undefined" ||
      typeof window.mixpanel.track !== "function"
    ) {
      return;
    }
    // Forward event with full metadata
    window.mixpanel.track(payload.eventName, {
      platform: payload.platform,
      url: payload.url,
      title: payload.title,
      interaction_type: payload.interactionType,
      component_id: payload.componentId,
      timestamp: payload.timestamp,
      ...(payload.errorMessage ? { error_message: payload.errorMessage } : {}),
    });
  }
}

/**
 * Segment Adapter
 * 
 * Maps library events to standard window.analytics.track() calls.
 */
class SegmentAdapter extends SocialShareAnalyticsPlugin {
  track(payload) {
    // Check if Segment's analytics.js is loaded
    if (
      typeof window === "undefined" ||
      typeof window.analytics === "undefined" ||
      typeof window.analytics.track !== "function"
    ) {
      return;
    }
    // Forward event to Segment
    window.analytics.track(payload.eventName, {
      platform: payload.platform,
      url: payload.url,
      title: payload.title,
      interaction_type: payload.interactionType,
      component_id: payload.componentId,
      ...(payload.errorMessage ? { error_message: payload.errorMessage } : {}),
    });
  }
}

/**
 * Plausible Analytics Adapter
 * 
 * Maps library events to window.plausible() custom goal calls.
 */
class PlausibleAdapter extends SocialShareAnalyticsPlugin {
  track(payload) {
    // Check if plausible script is active
    if (typeof window === "undefined" || typeof window.plausible !== "function") {
      return;
    }
    // Forward event as a custom goal with properties
    window.plausible(payload.eventName, {
      props: {
        platform: payload.platform,
        url: payload.url,
        interaction_type: payload.interactionType,
        component_id: payload.componentId,
      },
    });
  }
}

/**
 * PostHog Adapter
 * 
 * Maps library events to window.posthog.capture() calls.
 */
class PostHogAdapter extends SocialShareAnalyticsPlugin {
  track(payload) {
    // Check if posthog is initialized
    if (
      typeof window === "undefined" ||
      typeof window.posthog === "undefined" ||
      typeof window.posthog.capture !== "function"
    ) {
      return;
    }
    // Forward event to PostHog
    window.posthog.capture(payload.eventName, {
      platform: payload.platform,
      url: payload.url,
      title: payload.title,
      interaction_type: payload.interactionType,
      component_id: payload.componentId,
      timestamp: payload.timestamp,
      ...(payload.errorMessage ? { error_message: payload.errorMessage } : {}),
    });
  }
}

/**
 * Custom / Callback Adapter
 * 
 * A generic adapter that allows passing any function as a plugin.
 * Useful for custom analytics pipelines or logging.
 */
class CustomAdapter extends SocialShareAnalyticsPlugin {
  /**
   * @param {function(Object): void} onTrack - Function called with the event payload.
   */
  constructor(onTrack) {
    super();
    if (typeof onTrack !== "function") {
      throw new TypeError("CustomAdapter expects a function argument.");
    }
    this._onTrack = onTrack;
  }

  track(payload) {
    this._onTrack(payload);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

const adapters = {
  SocialShareAnalyticsPlugin,
  GoogleAnalyticsAdapter,
  MixpanelAdapter,
  SegmentAdapter,
  PlausibleAdapter,
  PostHogAdapter,
  CustomAdapter,
};

// CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = adapters;
}

// Global browser export (for CDN users)
if (typeof window !== "undefined") {
  window.SocialShareAnalytics = adapters;
}
