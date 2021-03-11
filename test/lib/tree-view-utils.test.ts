import 'ts-jest';
import {TreeViewUtils, HierarchyItem} from "../../src";

export interface MockCategoryType {
  id: string;
  name: string;
  parentId?: string;
  someExtraInfo?: string;
}

export const mockCategories: MockCategoryType[] = [
  {
    id: 'C_A1',
    name: 'Category A1',
    someExtraInfo: 'Extra Info C_A1',
  },
  {
    id: 'C_A1_1',
    name: 'Subcategory A1_1',
    parentId: 'C_A1',
  },
  {
    id: 'C_A1_1_1',
    name: 'Special category A1_1_1',
    parentId: 'C_A1_1',
  },
  {
    id: 'C_A1_2',
    name: 'Subcategory A1_2',
    parentId: 'C_A1',
    someExtraInfo: 'Extra Info C_A1',
  },
  {
    id: 'C_A1_3',
    name: 'Subcategory A1_3',
    parentId: 'C_A1',
  },
  {
    id: 'C_A2',
    name: 'Category A3',
  },
  {
    id: 'C_A3',
    name: 'Category A3',
  },
];


describe('Tree View Utils Test Suite', () => {
  test('Create hierarchy from flat fata.', async () => {
    const hierarchy: Record<string, HierarchyItem<MockCategoryType>> = TreeViewUtils.createHierarchy(mockCategories);
    console.log("hierarchy", hierarchy)
    checkStringArrayEquality(mockCategories.map(e => e.id), Object.keys(hierarchy))
  });

  test('Create hierarchy and retrieve only the root elements.', async () => {
    const hierarchy = TreeViewUtils.createHierarchy(mockCategories);
    const roots = TreeViewUtils.getRootElements(hierarchy);
    checkStringArrayEquality(mockCategories.filter(e => !e.parentId).map(e => e.id), Object.keys(roots))
  });

  test('Get absolute id path for hierarchy item.', async () => {
    const hierarchy = TreeViewUtils.createHierarchy(mockCategories);

    const subSubCat = Object.values(hierarchy).find(e => e.id === 'C_A1_1_1')
    expect(subSubCat).toBeDefined()
    if(subSubCat){
      const path = TreeViewUtils.retrieveAbsolutHierarchyPath(subSubCat, hierarchy);
      expect(path).toEqual([ 'C_A1', 'C_A1_1', 'C_A1_1_1' ]);
    }
  });
});

function checkStringArrayEquality(arr1: string[], arr2: string[]) {
  expect(arr1.sort()).toEqual(arr2.sort());
}