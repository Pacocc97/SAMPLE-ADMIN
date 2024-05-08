import type { Category, Image, Prisma } from "@prisma/client";

interface CategoryTree {
  id: string;
  name: string;
  parentId: string | null;
  characteristics: Prisma.JsonValue | null;
  parent: Category | null;
  child: Category[] | null;
  slug: string;
  description: string | null;
  imageId: string | null;
  image: Image | null;
}

interface ICategoryRecord {
  [key: string]: CategoryTree;
}

/**
 * Restructures categories array, showing parent categories at a top level array.
 * Then showing an object key that contents an array of all children categories of each parent category.
 *
 * @param {CategoryTree[]} arr
 * @returns
 */
function categoryStructure(arr: CategoryTree[]) {
  const tree: CategoryTree[] = [],
    mappedArr: ICategoryRecord = {} as ICategoryRecord;
  let arrElem: CategoryTree, mappedElem: CategoryTree;

  // First map the nodes of the array to an object -> create a hash table.
  if (arr) {
    for (let i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i] as CategoryTree;
      mappedArr[arrElem.id] = arrElem;
      const sampleArr = mappedArr[arrElem.id];
      if (sampleArr) {
        sampleArr.child = [];
      }
    }
  }
  for (const id in mappedArr) {
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id] as CategoryTree;
      // If the element is not at the root level, add it to its parent array of child.

      const mappParent = mappedElem["parentId"];
      const mappNext = mappParent && mappedArr[mappParent];
      const nextChild = mappNext && mappNext["child"];

      if (nextChild) {
        nextChild.push(mappedElem);
      }
      // If the element is at the root level, add it to first level elements array.
      else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
}

export default categoryStructure;
