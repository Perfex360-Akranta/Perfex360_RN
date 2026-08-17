import React from 'react';
import {ScrollView} from 'react-native';

import TreeItem from '../components/forms/MenuTreeComponent';
import { menuData } from '../utils/MenuData';

const MenuScreen = ({navigation}: any) => {
  return (
    <ScrollView>
      {menuData.map(item => (
        <TreeItem
          key={item.id}
          item={item}
          navigation={navigation}
        />
      ))}
    </ScrollView>
  );
};

export default MenuScreen;