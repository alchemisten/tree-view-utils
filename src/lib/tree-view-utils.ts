export type HierarchyItem<T> = T & { parentId?: string, nodeChildren?: HierarchyItem<T>[] }
export type ViewHierarchy<T> = Record<string, HierarchyItem<T>>
export type IdExtractor<T, K> = (elem: T) => K
const defaultIdExtractor: IdExtractor<any, string> = (elem) => elem.id
const defaultParentIdExtractor: IdExtractor<any, string | undefined> = (elem) => elem.parentId
export type ParentPath = string[]
export type ParentPathMap = Record<string, string[]>

export class TreeViewUtils {
  static createHierarchy<T>(
      templates: T[],
      idExtractor: IdExtractor<T, string> = (elem) => defaultIdExtractor(elem),
      parentIdExtractor: IdExtractor<T, string | undefined> = (elem) => defaultParentIdExtractor(elem),
      isLeafDetector?: (elem: T) => boolean
  ): ViewHierarchy<T> {
    const hierarchy: ViewHierarchy<T> = {}

    for (const template of templates) {
      if(template){
        const templateId = idExtractor(template);

        if (templateId) {
          const parentId = parentIdExtractor(template);
          const isLeaf = (isLeafDetector && typeof isLeafDetector === 'function' && isLeafDetector(template)) ?? undefined
          hierarchy[templateId] = {
            ...template,
            parentId: parentId,
            nodeChildren: hierarchy[templateId]?.nodeChildren ?? [],
            isLeaf: isLeaf
          }

          if (parentId) {
            const child: HierarchyItem<T> = hierarchy[templateId]
            const parent = hierarchy[parentId]
            if (!parent || !parent.nodeChildren) {
              hierarchy[parentId] = {
                templateChildren: [child],
                isLeaf: false
              } as any // We just have to create a skeleton for now!
            } else {
              parent.nodeChildren.push(child);
            }
          }
        } else {
          throw Error("Each template has to have a unique id!")
        }
      } else {
        // "Somehow the template is undefined, should not happen!")
      }
    }
    return hierarchy;
  }

  static getRootElements<T>(hierarchy: ViewHierarchy<T>): ViewHierarchy<T> {
    return Object.keys(hierarchy)
        .filter(hierarchyId => !hierarchy[hierarchyId].parentId)
        .reduce((obj, key) => {
          obj[key] = hierarchy[key];
          return obj;
        }, {} as ViewHierarchy<T>);
  }

  static retrieveAbsolutHierarchyPath<T>(node: HierarchyItem<T>,
                                         hierarchy: ViewHierarchy<T>,
                                         idExtractor: IdExtractor<T, string> = (elem) => defaultIdExtractor(elem),
                                         parentIdExtractor: IdExtractor<T, string | undefined> = (elem) => defaultParentIdExtractor(elem),
                                         includeCurrentNode: boolean = true
  ): ParentPath {
    const parentIdSet: Set<string> = new Set(); // Needed for O(1) cycle detection!
    const parentIds: ParentPath = []
    let nextParentId: string | undefined = parentIdExtractor(node)
    if (includeCurrentNode && node) {
      const nodeId = idExtractor(node);
      if (nodeId) {
        parentIds.push(nodeId);
        parentIdSet.add(nodeId);
      }
    }
    while (nextParentId) {
      if (parentIdSet.has(nextParentId)) {
        return parentIds; // detected cycle, abort
      }
      parentIds.push(nextParentId);
      parentIdSet.add(nextParentId);
      nextParentId = parentIdExtractor(hierarchy[nextParentId]);
    }
    return parentIds.reverse();
  }
}