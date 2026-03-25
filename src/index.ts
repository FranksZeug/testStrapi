import type { Core } from '@strapi/strapi';

const TOPIC_UID = 'api::topic.topic';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const topicCT = strapi.contentTypes[TOPIC_UID];
    if (!topicCT) return;

    const cm = strapi.plugin('content-manager').service('content-types') as {
      findConfiguration: (ct: object) => Promise<Record<string, unknown> & { settings?: Record<string, unknown> }>;
      updateConfiguration: (ct: object, cfg: Record<string, unknown>) => Promise<unknown>;
    };

    const cfg = await cm.findConfiguration(topicCT);
    const settings = cfg.settings;

    if (!settings || typeof settings !== 'object') return;

    if (settings.defaultSortBy === 'path' && settings.defaultSortOrder === 'ASC') {
      return;
    }

    await cm.updateConfiguration(topicCT, {
      ...cfg,
      settings: {
        ...settings,
        defaultSortBy: 'path',
        defaultSortOrder: 'ASC',
      },
    });
  },
};
