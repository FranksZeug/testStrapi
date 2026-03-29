import type { Core } from '@strapi/strapi';

import { germanLabelsByUid, mergeFieldMetadatas } from './bootstrap/german-content-manager-labels';

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
    const cm = strapi.plugin('content-manager').service('content-types') as {
      findConfiguration: (ct: object) => Promise<Record<string, unknown> & { settings?: Record<string, unknown>; metadatas?: Record<string, unknown> }>;
      updateConfiguration: (ct: object, cfg: Record<string, unknown>) => Promise<unknown>;
    };

    for (const uid of Object.keys(germanLabelsByUid)) {
      const ct = strapi.contentTypes[uid];
      if (!ct) continue;

      const patches = germanLabelsByUid[uid];
      const cfg = await cm.findConfiguration(ct);
      const metadatas = cfg.metadatas as Record<string, { edit?: Record<string, unknown>; list?: Record<string, unknown> }> | undefined;

      const next: Record<string, unknown> = {
        ...cfg,
        metadatas: mergeFieldMetadatas(metadatas, patches),
      };

      if (uid === TOPIC_UID) {
        const settings = cfg.settings;
        if (settings && typeof settings === 'object') {
          const s = settings as Record<string, unknown>;
          next.settings = {
            ...s,
            defaultSortBy: 'path',
            defaultSortOrder: 'ASC',
            // Relationen/Picker laden oft nur dieses eine Feld — "path" kann fehlen oder
            // bei Berechtigungen ausgeblendet sein, dann zeigt die UI die documentId.
            mainField: 'name',
          };
        }

        const layouts =
          cfg.layouts && typeof cfg.layouts === 'object' && !Array.isArray(cfg.layouts)
            ? { ...(cfg.layouts as Record<string, unknown>) }
            : {};
        layouts.list = ['path', 'level', 'name', 'parent_topic'];
        next.layouts = layouts;
      }

      await cm.updateConfiguration(ct, next);
    }
  },
};
