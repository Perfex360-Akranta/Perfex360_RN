import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';

import TreeItem from '../../components/forms/MenuTreeComponent1';
import {getMenuData} from '../../services/api/menuApi';
import {useGrid} from '../../context/GridProvider';



const MenuScreen = ({navigation}: any) => {

  const {currentUser} = useGrid();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = currentUser?.userId ?? '';

  useEffect(() => {
    console.log(
      'MenuScreen currentUser:',
      currentUser
    );
     if (!currentUser?.userId) {
        console.log(
        'User not logged in - menu API will not be called'
      );
        return;
    }
    loadRootMenus();
  }, [currentUser?.userId]);

  /**
   * Load root menus
   */
  const loadRootMenus = async () => {
    try {
         const userId = currentUser?.userId;

    if (!userId) {
      return;
    }
      setLoading(true);
console.log(
        'Loading root menus for:',
        userId
      );
      const data = await getMenuData(
        '0',
        userId,
      );

      setMenuItems(data);

    } catch (error) {

      console.error(
        'Error loading root menus:',
        error,
      );

    } finally {
      setLoading(false);
    }
  };

  /**
   * Menu click
   */
  const handleMenuClick = async (item: MenuItem) => {

    console.log(
      'Menu clicked:',
      item.menuNumber,
      item.menuCaption,
    );

    /**
     * Leaf menu
     */
    if (!item.parent) {
      handleNavigation(item);
      return;
    }

    /**
     * Children already loaded
     */
    if (item.children !== undefined) {

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            expanded: !item.expanded,
          },
        ),
      );

      return;
    }

    /**
     * First click on parent
     * Load children from API
     */
    try {

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            loading: true,
          },
        ),
      );

      const children = await getMenuData(
        item.menuNumber,
        userId,
      );

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            children: children || [],
            expanded: true,
            loading: false,
          },
        ),
      );

    } catch (error) {

      console.error(
        'Error loading children for:',
        item.menuNumber,
        error,
      );

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            loading: false,
          },
        ),
      );
    }
  };

  /**
   * Update menu item recursively
   */
  const updateMenuItem = (
    items: MenuItem[],
    menuNumber: string,
    changes: Partial<MenuItem>,
  ): MenuItem[] => {

    return items.map(item => {

      if (item.menuNumber === menuNumber) {

        return {
          ...item,
          ...changes,
        };
      }

      if (item.children) {

        return {
          ...item,

          children: updateMenuItem(
            item.children,
            menuNumber,
            changes,
          ),
        };
      }

      return item;
    });
  };

  /**
   * Navigate when leaf menu is clicked
   */
  const handleNavigation = (item: MenuItem) => {

    console.log(
      'Navigate:',
      item.menuNumber,
     // item.angularPath,
    );

    navigation.closeDrawer();

    /**
     * Your existing RN screen navigation
     */
    // if (item.screen) {

    //   navigation.navigate('Main', {
    //     screen: item.screen,
    //   });

    //   return;
    // }

    /**
     * Angular navigation
     */
    // if (item.angularPath) {

    //   navigation.navigate('AngularScreen', {
    //     path: item.angularPath,
    //     menuNumber: item.menuNumber,
    //     menuName: item.menuName,
    //     menuCaption: item.menuCaption,
    //     relatedFilter: item.relatedFilter,
    //     filterNeed: item.filterNeed,
    //   });

    //   return;
    // }

    console.warn(
      'No navigation configured for menu:',
      item.menuNumber,
    );
  };

  if (loading) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView>
      {menuItems.map(item => (
        <TreeItem
          key={item.menuNumber}
          item={item}
          //navigation={navigation}
          onPress={handleMenuClick}
        />
      ))}
    </ScrollView>
  );
};

export default MenuScreen;