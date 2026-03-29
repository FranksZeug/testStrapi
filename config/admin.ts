import type { Core } from '@strapi/strapi';

/**
 * Preview: https://docs.strapi.io/cms/features/preview
 * Nutzt die bestehende Next-Route `/preview` mit documentId, secret, status, locale.
 */
const config = ({ env }: Core.Config.Shared.ConfigParams) =>
  ({
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: env.bool('PREVIEW_ENABLED', true),
      config: {
        allowedOrigins: [env('CLIENT_URL', 'http://localhost:3000')],
        async handler(
          uid: string,
          { documentId, locale, status }: { documentId: string; locale?: string | null; status?: string }
        ) {
          if (uid !== 'api::publication.publication') {
            return null;
          }

          const clientUrl = env('CLIENT_URL', 'http://localhost:3000').replace(/\/$/, '');
          const secret = env('PREVIEW_SECRET');
          if (!secret) {
            return null;
          }

          if (!documentId) {
            return null;
          }

          const params = new URLSearchParams({
            documentId,
            secret,
            status: status === 'published' ? 'published' : 'draft',
          });

          if (locale) {
            params.set('locale', locale);
          }

          return `${clientUrl}/preview?${params.toString()}`;
        },
      },
    },
  }) as Core.Config.Admin;

export default config;
