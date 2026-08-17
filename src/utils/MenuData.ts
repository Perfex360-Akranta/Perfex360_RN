// menuData.ts

export const menuData = [
  {
    id: '1',
    title: 'Dashboard',
    screen: 'Dashboard',
  },
  {
        id: '3',
        title: 'Abnormality',
        children: [
          {
            id: '3-1',
            title: 'Idenification',
            screen: 'AbnForm',
          },
          {
            id: '3-2',
            title: 'Allocation',
            screen: 'AbnAllocation',
          },
          {
            id: '3-3',
            title: 'Completion',
            screen: 'AbnComp',
          },
          {
            id: '3-4',
            title: 'View',
            screen: 'AbnView',
          },
        ],
      },
  
];