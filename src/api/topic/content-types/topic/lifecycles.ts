const TOPIC_UID = 'api::topic.topic';
const MAX_TOPIC_DEPTH = 5;

type RelationRef = {
  id?: number;
  documentId?: string;
};

const pickParentRefFromData = (data: Record<string, unknown>): RelationRef | null => {
  const raw = data.parent_topic as unknown;

  if (!raw) return null;

  if (typeof raw === 'number') return { id: raw };
  if (typeof raw === 'string') return { documentId: raw };

  if (typeof raw === 'object' && raw !== null) {
    const relation = raw as {
      id?: number;
      documentId?: string;
      connect?: Array<{ id?: number; documentId?: string }>;
      set?: Array<{ id?: number; documentId?: string }>;
      disconnect?: unknown;
    };

    if (Array.isArray(relation.connect) && relation.connect[0]) {
      return relation.connect[0];
    }

    if (Array.isArray(relation.set)) {
      return relation.set[0] ?? null;
    }

    if ('disconnect' in relation) {
      return null;
    }

    if (relation.id || relation.documentId) {
      return { id: relation.id, documentId: relation.documentId };
    }
  }

  return null;
};

const loadTopicByRef = async (ref: RelationRef) => {
  const where = ref.id ? { id: ref.id } : { documentId: ref.documentId };
  return strapi.db.query(TOPIC_UID).findOne({
    where,
    select: ['id', 'documentId'],
    populate: {
      parent_topic: {
        select: ['id', 'documentId'],
      },
    },
  });
};

const buildPath = (parentPath: string | null, name: string) => {
  return parentPath ? `${parentPath} > ${name}` : name;
};

const assertTopicDepthLimit = async (
  parentRef: RelationRef | null,
  currentTopicRef?: RelationRef
) => {
  if (!parentRef) return;

  let depth = 1; // current topic level
  let cursorRef: RelationRef | null = parentRef;

  const visited = new Set<string>();
  if (currentTopicRef?.id || currentTopicRef?.documentId) {
    visited.add(`${currentTopicRef.id ?? ''}:${currentTopicRef.documentId ?? ''}`);
  }

  while (cursorRef) {
    depth += 1;

    if (depth > MAX_TOPIC_DEPTH) {
      throw new Error(`Topic hierarchy supports a maximum of ${MAX_TOPIC_DEPTH} levels.`);
    }

    const node = await loadTopicByRef(cursorRef);
    if (!node) break;

    const marker = `${node.id ?? ''}:${node.documentId ?? ''}`;
    if (visited.has(marker)) {
      throw new Error('Circular topic hierarchy is not allowed.');
    }
    visited.add(marker);

    cursorRef = node.parent_topic
      ? { id: node.parent_topic.id, documentId: node.parent_topic.documentId }
      : null;
  }
};

const computeLevelAndPath = async (
  parentRef: RelationRef | null,
  topicName: string,
  currentTopicRef?: RelationRef
) => {
  let level = 1;
  let parentPath: string | null = null;

  if (parentRef) {
    await assertTopicDepthLimit(parentRef, currentTopicRef);
    const parent = await strapi.db.query(TOPIC_UID).findOne({
      where: parentRef.id ? { id: parentRef.id } : { documentId: parentRef.documentId },
      select: ['id', 'documentId', 'path', 'level'],
    });

    if (!parent) {
      throw new Error('Selected parent topic does not exist.');
    }

    level = (parent.level ?? 1) + 1;
    parentPath = parent.path ?? null;
  }

  if (level > MAX_TOPIC_DEPTH) {
    throw new Error(`Topic hierarchy supports a maximum of ${MAX_TOPIC_DEPTH} levels.`);
  }

  return { level, path: buildPath(parentPath, topicName) };
};

const syncDescendantPaths = async (topicId: number) => {
  const topic = await strapi.db.query(TOPIC_UID).findOne({
    where: { id: topicId },
    select: ['id', 'name', 'path', 'level'],
  });

  if (!topic) return;

  const children = await strapi.db.query(TOPIC_UID).findMany({
    where: { parent_topic: { id: topicId } },
    select: ['id', 'name'],
  });

  for (const child of children) {
    const childPath = buildPath(topic.path ?? topic.name, child.name);
    const childLevel = (topic.level ?? 1) + 1;

    await strapi.db.query(TOPIC_UID).update({
      where: { id: child.id },
      data: {
        path: childPath,
        level: childLevel,
      },
    });

    await syncDescendantPaths(child.id);
  }
};

const getSubtreeHeight = async (topicId: number): Promise<number> => {
  const children = await strapi.db.query(TOPIC_UID).findMany({
    where: { parent_topic: { id: topicId } },
    select: ['id'],
  });

  if (!children.length) return 1;

  let maxChildHeight = 0;
  for (const child of children) {
    const childHeight = await getSubtreeHeight(child.id);
    if (childHeight > maxChildHeight) {
      maxChildHeight = childHeight;
    }
  }

  return 1 + maxChildHeight;
};

export default {
  async beforeCreate(event) {
    const data = (event.params?.data ?? {}) as Record<string, unknown>;
    const parentRef = pickParentRefFromData(data);
    const name = String(data.name ?? '').trim();

    if (!name) {
      throw new Error('Topic name is required.');
    }

    const { level, path } = await computeLevelAndPath(parentRef, name);
    data.level = level;
    data.path = path;
  },

  async beforeUpdate(event) {
    const data = (event.params?.data ?? {}) as Record<string, unknown>;
    const where = (event.params?.where ?? {}) as { id?: number; documentId?: string };
    const currentTopicRef: RelationRef = { id: where.id, documentId: where.documentId };

    const currentTopic = await strapi.db.query(TOPIC_UID).findOne({
      where: where.id ? { id: where.id } : { documentId: where.documentId },
      select: ['id', 'documentId', 'name'],
      populate: {
        parent_topic: {
          select: ['id', 'documentId'],
        },
      },
    });

    if (!currentTopic) return;

    const parentTouched = Object.prototype.hasOwnProperty.call(data, 'parent_topic');
    const nameTouched = Object.prototype.hasOwnProperty.call(data, 'name');

    if (!parentTouched && !nameTouched) return;

    const parentRef = parentTouched
      ? pickParentRefFromData(data)
      : currentTopic.parent_topic
        ? {
            id: currentTopic.parent_topic.id,
            documentId: currentTopic.parent_topic.documentId,
          }
        : null;

    const effectiveName = String(data.name ?? currentTopic.name ?? '').trim();
    if (!effectiveName) {
      throw new Error('Topic name is required.');
    }

    const { level, path } = await computeLevelAndPath(parentRef, effectiveName, currentTopicRef);

    if (currentTopic.id) {
      const subtreeHeight = await getSubtreeHeight(currentTopic.id);
      const deepestDescendantLevel = level + subtreeHeight - 1;
      if (deepestDescendantLevel > MAX_TOPIC_DEPTH) {
        throw new Error(
          `Moving this topic would exceed the maximum hierarchy depth of ${MAX_TOPIC_DEPTH}.`
        );
      }
    }

    data.level = level;
    data.path = path;
  },

  async afterUpdate(event) {
    const where = (event.params?.where ?? {}) as { id?: number };
    if (!where.id) return;

    await syncDescendantPaths(where.id);
  },
};
