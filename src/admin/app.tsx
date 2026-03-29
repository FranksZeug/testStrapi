import { contentManagerDeBlocksWysiwyg } from './content-manager-de-blocks-wysiwyg';
import { deContentTypeDisplayNames } from './de-content-type-display-names';

export default {
  config: {
    locales: ['de'],
    translations: {
      de: {
        ...contentManagerDeBlocksWysiwyg,
        ...deContentTypeDisplayNames,
      },
    },
  },
};
